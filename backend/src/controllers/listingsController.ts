import { Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { ListingModule, ListingStatus, RequestStatus } from '@prisma/client';

// Haversine formula to compute distance in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

export const getListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      module,
      category,
      search,
      neighborhood,
      isFree,
      status,
      lat,
      lng,
      radiusKm,
      userId,
      limit,
    } = req.query;

    const where: any = {};

    // Filter by module if provided
    if (module && typeof module === 'string') {
      const normalizedModule = module.toUpperCase().replace('-', '_');
      if (Object.values(ListingModule).includes(normalizedModule as ListingModule)) {
        where.module = normalizedModule as ListingModule;
      }
    }

    // Filter by status (default to ACTIVE unless explicitly requested)
    if (status && typeof status === 'string') {
      where.status = status as ListingStatus;
    } else if (!userId) {
      where.status = ListingStatus.ACTIVE;
    }

    if (userId && typeof userId === 'string') {
      where.userId = userId;
    }

    if (category && typeof category === 'string' && category !== 'All') {
      where.category = { contains: category };
    }

    if (neighborhood && typeof neighborhood === 'string' && neighborhood !== 'All') {
      where.neighborhood = neighborhood;
    }

    if (isFree !== undefined) {
      where.isFree = isFree === 'true';
    }

    // Text search across title, description, category
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { category: { contains: searchTerm } },
        { neighborhood: { contains: searchTerm } },
      ];
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            organizationName: true,
            avatarUrl: true,
            role: true,
            verificationStatus: true,
            ratingAvg: true,
            ratingCount: true,
            neighborhood: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit as string, 10) : 50,
    });

    const userLat = lat ? parseFloat(lat as string) : 13.0827;
    const userLng = lng ? parseFloat(lng as string) : 80.2707;
    const maxRadius = radiusKm ? parseFloat(radiusKm as string) : null;

    // Attach calculated distance and sanitize exact address
    let results = listings.map((item) => {
      const distance = calculateDistanceKm(userLat, userLng, item.latitude, item.longitude);
      const isOwner = req.user?.id === item.userId;

      return {
        ...item,
        distanceKm: distance,
        // Only return exact address to the owner or sanitized
        exactPickupAddress: isOwner ? item.exactPickupAddress : undefined,
      };
    });

    // Apply radius filtering if specified
    if (maxRadius !== null && !isNaN(maxRadius)) {
      results = results.filter((item) => item.distanceKm <= maxRadius);
    }

    res.json({
      count: results.length,
      listings: results,
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ message: 'Server error retrieving listings.' });
  }
};

export const getListingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            organizationName: true,
            avatarUrl: true,
            role: true,
            bio: true,
            verificationStatus: true,
            ratingAvg: true,
            ratingCount: true,
            neighborhood: true,
            createdAt: true,
          },
        },
      },
    });

    if (!listing || listing.status === ListingStatus.DELETED) {
      res.status(404).json({ message: 'Listing not found.' });
      return;
    }

    // Check if the current user is authorized to see the exact address
    let canSeeExactAddress = false;
    if (req.user) {
      if (req.user.id === listing.userId) {
        canSeeExactAddress = true;
      } else {
        const acceptedRequest = await prisma.request.findFirst({
          where: {
            listingId: listing.id,
            requesterId: req.user.id,
            status: { in: [RequestStatus.ACCEPTED, RequestStatus.IN_PROGRESS, RequestStatus.COMPLETED] },
          },
        });
        if (acceptedRequest) {
          canSeeExactAddress = true;
        }
      }
    }

    const userLat = 13.0827;
    const userLng = 80.2707;
    const distanceKm = calculateDistanceKm(userLat, userLng, listing.latitude, listing.longitude);

    res.json({
      listing: {
        ...listing,
        distanceKm,
        exactPickupAddress: canSeeExactAddress ? listing.exactPickupAddress : undefined,
      },
    });
  } catch (error) {
    console.error('Get listing by ID error:', error);
    res.status(500).json({ message: 'Server error fetching listing details.' });
  }
};

export const createListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const {
      module,
      title,
      description,
      category,
      isFree,
      price,
      priceUnit,
      depositAmount,
      quantity,
      quantityUnit,
      neighborhood,
      city,
      approximateAddress,
      exactPickupAddress,
      metadata,
    } = req.body;

    if (!title || !description || !category || !module) {
      res.status(400).json({ message: 'Title, description, category, and module are required.' });
      return;
    }

    const neighborhoodCoords: Record<string, { lat: number; lng: number }> = {
      'Anna Nagar': { lat: 13.0850, lng: 80.2100 },
      'Ashok Nagar': { lat: 13.0373, lng: 80.2123 },
      'Guindy': { lat: 13.0067, lng: 80.2025 },
      'Guindy Industrial Estate': { lat: 13.0125, lng: 80.2080 },
      'Adyar': { lat: 13.0012, lng: 80.2565 },
      'Velachery': { lat: 12.9780, lng: 80.2210 },
      'T. Nagar': { lat: 13.0418, lng: 80.2341 },
    };

    const targetNeighborhood = neighborhood || 'Anna Nagar';
    const coords = neighborhoodCoords[targetNeighborhood] || { lat: 13.0827, lng: 80.2707 };

    // Calculate baseline environmental metrics based on module and category
    let co2AvoidedKg = 1.5;
    let wasteDivertedKg = 1.0;

    const mod = module.toUpperCase() as ListingModule;
    if (mod === ListingModule.SHARE_BORROW) {
      co2AvoidedKg = 12.0;
      wasteDivertedKg = 3.5;
    } else if (mod === ListingModule.FOOD_RESCUE) {
      co2AvoidedKg = 2.1; // per portion / box
      wasteDivertedKg = 0.65;
    } else if (mod === ListingModule.INDUSTRIAL_SURPLUS) {
      co2AvoidedKg = 3.5; // per kg or unit
      wasteDivertedKg = 1.0;
    } else if (mod === ListingModule.GREEN_MARKETPLACE) {
      co2AvoidedKg = 5.0;
      wasteDivertedKg = 1.2;
    }

    let parsedMetadata = {};
    if (metadata) {
      try {
        parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      } catch (e) {
        parsedMetadata = {};
      }
    }

    // Process uploaded image files if any
    const files = req.files as Express.Multer.File[] | undefined;
    const uploadedImages: { imageUrl: string; isCover: boolean; displayOrder: number }[] = [];

    if (files && files.length > 0) {
      files.forEach((file, index) => {
        uploadedImages.push({
          imageUrl: `/uploads/listings/${file.filename}`,
          isCover: index === 0,
          displayOrder: index,
        });
      });
    } else if (req.body.imageUrl) {
      uploadedImages.push({
        imageUrl: req.body.imageUrl,
        isCover: true,
        displayOrder: 0,
      });
    } else {
      // Provide realistic high-res placeholder image based on module
      const defaultPlaceholders: Record<ListingModule, string> = {
        [ListingModule.SHARE_BORROW]: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
        [ListingModule.FOOD_RESCUE]: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        [ListingModule.INDUSTRIAL_SURPLUS]: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
        [ListingModule.GREEN_MARKETPLACE]: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      };
      uploadedImages.push({
        imageUrl: defaultPlaceholders[mod] || defaultPlaceholders[ListingModule.SHARE_BORROW],
        isCover: true,
        displayOrder: 0,
      });
    }

    const listing = await prisma.listing.create({
      data: {
        userId: req.user.id,
        module: mod,
        title,
        description,
        category,
        isFree: isFree === 'true' || isFree === true,
        price: price ? parseFloat(price) : 0,
        priceUnit: priceUnit || null,
        depositAmount: depositAmount ? parseFloat(depositAmount) : 0,
        quantity: quantity ? parseFloat(quantity) : 1,
        quantityUnit: quantityUnit || 'item',
        neighborhood: targetNeighborhood,
        city: city || 'Chennai',
        latitude: coords.lat,
        longitude: coords.lng,
        approximateAddress: approximateAddress || `Near ${targetNeighborhood} Center`,
        exactPickupAddress: exactPickupAddress || null,
        metadata: parsedMetadata,
        co2AvoidedKgPerUnit: co2AvoidedKg,
        wasteDivertedKgPerUnit: wasteDivertedKg,
        isDemo: false,
        images: {
          create: uploadedImages,
        },
      },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            fullName: true,
            organizationName: true,
            avatarUrl: true,
            role: true,
            verificationStatus: true,
            ratingAvg: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Listing published successfully! It is now visible to the local community.',
      listing,
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ message: 'Server error creating listing.' });
  }
};

export const updateListingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const id = req.params.id as string;
    const { status } = req.body;

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      res.status(404).json({ message: 'Listing not found.' });
      return;
    }

    if (listing.userId !== req.user.id && req.user.role !== 'COMMUNITY_ADMIN') {
      res.status(403).json({ message: 'You are not authorized to modify this listing.' });
      return;
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: { status: status as ListingStatus },
    });

    res.json({
      message: `Listing status updated to ${status}.`,
      listing: updated,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error updating status.' });
  }
};

export const deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const id = req.params.id as string;
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      res.status(404).json({ message: 'Listing not found.' });
      return;
    }

    if (listing.userId !== req.user.id && req.user.role !== 'COMMUNITY_ADMIN') {
      res.status(403).json({ message: 'Unauthorized to delete this listing.' });
      return;
    }

    await prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.DELETED },
    });

    res.json({ message: 'Listing removed successfully.' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ message: 'Server error deleting listing.' });
  }
};
