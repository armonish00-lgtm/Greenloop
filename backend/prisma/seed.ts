import { PrismaClient, UserRole, VerificationStatus, ListingModule, ListingStatus, RequestStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding GreenLoop database with Chennai demo accounts & circular listings...');

  // Clean existing demo data if any
  await prisma.auditLog.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.request.deleteMany({});
  await prisma.listingImage.deleteMany({});
  await prisma.listing.deleteMany({});
  await prisma.verification.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.user.deleteMany({});

  const commonPasswordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Core Demo Users
  const userAnanya = await prisma.user.create({
    data: {
      email: 'ananya@greenloop.demo',
      passwordHash: commonPasswordHash,
      fullName: 'Ananya Ramachandran',
      phoneNumber: '+91 98401 23456',
      role: UserRole.INDIVIDUAL,
      neighborhood: 'Anna Nagar',
      city: 'Chennai',
      latitude: 13.0850,
      longitude: 80.2100,
      bio: 'Eco-conscious designer & DIY enthusiast. Passionate about community sharing and zero-waste living.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      verificationStatus: VerificationStatus.VERIFIED,
      ratingAvg: 4.95,
      ratingCount: 18,
    }
  });

  const userRHA = await prisma.user.create({
    data: {
      email: 'rha_chennai@greenloop.demo',
      passwordHash: commonPasswordHash,
      fullName: 'Robin Hood Army — Chennai Chapter',
      organizationName: 'Robin Hood Army (NGO)',
      phoneNumber: '+91 94440 98765',
      role: UserRole.NGO,
      neighborhood: 'Guindy',
      city: 'Chennai',
      latitude: 13.0067,
      longitude: 80.2025,
      bio: 'Volunteer-driven organization serving surplus food from restaurants and events to homeless shelters across Chennai.',
      avatarUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=400&q=80',
      verificationStatus: VerificationStatus.VERIFIED,
      ratingAvg: 5.00,
      ratingCount: 42,
    }
  });

  const userCoromandel = await prisma.user.create({
    data: {
      email: 'coromandel@greenloop.demo',
      passwordHash: commonPasswordHash,
      fullName: 'Coromandel Industrial Reclaimers',
      organizationName: 'Coromandel Circular Solutions Pvt Ltd',
      phoneNumber: '+91 44 2235 1100',
      role: UserRole.BUSINESS,
      neighborhood: 'Guindy Industrial Estate',
      city: 'Chennai',
      latitude: 13.0125,
      longitude: 80.2080,
      bio: 'Pioneering circular economy logistics for Chennai manufacturing clusters. Redirecting industrial textiles, polymers, and timber into productive reuse.',
      avatarUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
      verificationStatus: VerificationStatus.VERIFIED,
      ratingAvg: 4.88,
      ratingCount: 29,
    }
  });

  const userEcoKrafts = await prisma.user.create({
    data: {
      email: 'ecokrafts@greenloop.demo',
      passwordHash: commonPasswordHash,
      fullName: 'Meera Krishnan — EcoKrafts',
      organizationName: 'EcoKrafts Upcycled Studio',
      phoneNumber: '+91 98409 55432',
      role: UserRole.INDIVIDUAL,
      neighborhood: 'Adyar',
      city: 'Chennai',
      latitude: 13.0012,
      longitude: 80.2565,
      bio: 'Turning post-consumer fabric, glass, and wood into bespoke everyday lifestyle goods.',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      verificationStatus: VerificationStatus.VERIFIED,
      ratingAvg: 4.92,
      ratingCount: 35,
    }
  });

  const userAdmin = await prisma.user.create({
    data: {
      email: 'admin@greenloop.demo',
      passwordHash: commonPasswordHash,
      fullName: 'Dr. Priya Sundaram',
      organizationName: 'GreenLoop Community Trust & Safety Team',
      phoneNumber: '+91 94441 00000',
      role: UserRole.COMMUNITY_ADMIN,
      neighborhood: 'Ashok Nagar',
      city: 'Chennai',
      latitude: 13.0373,
      longitude: 80.2123,
      bio: 'Chennai Community Lead & Sustainability Auditor for GreenLoop.',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      verificationStatus: VerificationStatus.VERIFIED,
      ratingAvg: 5.00,
      ratingCount: 50,
    }
  });

  // Additional community peer for transactions
  const userKarthik = await prisma.user.create({
    data: {
      email: 'karthik@greenloop.demo',
      passwordHash: commonPasswordHash,
      fullName: 'Karthik Subramanian',
      phoneNumber: '+91 98410 77889',
      role: UserRole.INDIVIDUAL,
      neighborhood: 'T. Nagar',
      city: 'Chennai',
      latitude: 13.0418,
      longitude: 80.2341,
      bio: 'Avid organic gardener, DIY builder, and circular economy advocate.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      verificationStatus: VerificationStatus.VERIFIED,
      ratingAvg: 4.85,
      ratingCount: 14,
    }
  });

  console.log('✓ Users created successfully');

  // 2. Create Listings Across the 4 Modules

  // --- MODULE 1: SHARE & BORROW ---
  const listingDrill = await prisma.listing.create({
    data: {
      userId: userAnanya.id,
      module: ListingModule.SHARE_BORROW,
      title: 'Bosch Cordless Hammer Drill 18V',
      description: 'Heavy duty brushless cordless hammer drill with 2 lithium-ion batteries and 24-piece masonry/wood drill bit set. Great for home renovation, shelving, and mounting.',
      category: 'Tools',
      status: ListingStatus.ACTIVE,
      isFree: true,
      price: 0,
      depositAmount: 0,
      quantity: 1,
      quantityUnit: 'tool',
      neighborhood: 'Anna Nagar',
      city: 'Chennai',
      latitude: 13.0850,
      longitude: 80.2100,
      approximateAddress: 'Near Anna Nagar Tower Park (approx 300m)',
      exactPickupAddress: 'Flat 4B, Green Terraces, 3rd Avenue, Anna Nagar East, Chennai 600102',
      co2AvoidedKgPerUnit: 14.5,
      wasteDivertedKgPerUnit: 2.8,
      isDemo: true,
      metadata: {
        maxBorrowDays: 4,
        condition: 'Like New',
        includes: ['Drill body', '2x 18V Batteries', 'Fast Charger', 'Drill Bit Box']
      },
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
            isCover: true,
            displayOrder: 0
          }
        ]
      }
    }
  });

  const listingTent = await prisma.listing.create({
    data: {
      userId: userKarthik.id,
      module: ListingModule.SHARE_BORROW,
      title: 'Quechua 4-Person Waterproof Camping Tent',
      description: 'Spacious Quechua MH100 4-person tent with dual vestibules, ground sheet, and rain tarp. Kept clean and dry in original storage bag.',
      category: 'Camping',
      status: ListingStatus.ACTIVE,
      isFree: true,
      price: 0,
      depositAmount: 500,
      quantity: 1,
      quantityUnit: 'tent',
      neighborhood: 'T. Nagar',
      city: 'Chennai',
      latitude: 13.0418,
      longitude: 80.2341,
      approximateAddress: 'Near Pondy Bazaar, T. Nagar',
      exactPickupAddress: '18 Venkatanarayana Road, T. Nagar, Chennai 600017',
      co2AvoidedKgPerUnit: 22.0,
      wasteDivertedKgPerUnit: 4.2,
      isDemo: true,
      metadata: {
        maxBorrowDays: 7,
        condition: 'Excellent',
        includes: ['Poles', 'Pegs', 'Waterproof rainfly', 'Ground tarp']
      },
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
            isCover: true,
            displayOrder: 0
          }
        ]
      }
    }
  });

  const listingLadder = await prisma.listing.create({
    data: {
      userId: userAnanya.id,
      module: ListingModule.SHARE_BORROW,
      title: 'Telescopic Aluminum Extension Ladder 12.5ft',
      description: 'Portable heavy-duty aluminium telescopic ladder. Collapses to 3 feet for easy car trunk transport, extends up to 12.5 feet safely.',
      category: 'Home',
      status: ListingStatus.ACTIVE,
      isFree: true,
      price: 0,
      depositAmount: 0,
      quantity: 1,
      quantityUnit: 'ladder',
      neighborhood: 'Anna Nagar',
      city: 'Chennai',
      latitude: 13.0835,
      longitude: 80.2130,
      approximateAddress: 'Near 2nd Avenue Metro, Anna Nagar',
      exactPickupAddress: 'Plot 89, 6th Main Road, Anna Nagar, Chennai 600040',
      co2AvoidedKgPerUnit: 18.0,
      wasteDivertedKgPerUnit: 8.5,
      isDemo: true,
      metadata: {
        maxBorrowDays: 3,
        condition: 'Good',
        weightCapacityKg: 150
      },
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
            isCover: true,
            displayOrder: 0
          }
        ]
      }
    }
  });

  // --- MODULE 2: FOOD RESCUE ---
  const listingMeals = await prisma.listing.create({
    data: {
      userId: userKarthik.id,
      module: ListingModule.FOOD_RESCUE,
      title: '70 Fresh South Indian Meal Boxes (Wedding Reception)',
      description: 'Hygienically packed hot vegetarian meals prepared 1.5 hours ago for a wedding banquet. Contains Sambar rice, curd rice, vegetable poriyal, and chapatis in food-grade compartmental containers.',
      category: 'Cooked Meals',
      status: ListingStatus.ACTIVE,
      isFree: true,
      price: 0,
      quantity: 70,
      quantityUnit: 'boxes',
      neighborhood: 'Adyar',
      city: 'Chennai',
      latitude: 13.0035,
      longitude: 80.2520,
      approximateAddress: 'Karpagam Gardens, Adyar (near banquet hall)',
      exactPickupAddress: 'Raj Mahal Mandapam, 4th Cross Street, Karpagam Gardens, Adyar, Chennai 600020',
      co2AvoidedKgPerUnit: 2.1,
      wasteDivertedKgPerUnit: 0.65,
      isDemo: true,
      metadata: {
        isVegetarian: true,
        preparedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        temperatureStatus: 'Warm (Insulated food warmers)',
        allergens: ['Dairy/Ghee'],
        requiresColdStorage: false
      },
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
            isCover: true,
            displayOrder: 0
          }
        ]
      }
    }
  });

  const listingBakery = await prisma.listing.create({
    data: {
      userId: userEcoKrafts.id,
      module: ListingModule.FOOD_RESCUE,
      title: '35 kg Artisanal Sourdough & Multigrain Loaves',
      description: 'Surplus daily bake from local organic sourdough bakery. Baked this morning at 6 AM, perfectly edible and fresh. Looking for distribution to children shelters or community kitchens.',
      category: 'Bakery Items',
      status: ListingStatus.ACTIVE,
      isFree: true,
      price: 0,
      quantity: 35,
      quantityUnit: 'kg',
      neighborhood: 'Anna Nagar',
      city: 'Chennai',
      latitude: 13.0880,
      longitude: 80.2140,
      approximateAddress: 'Near Shanti Colony, Anna Nagar',
      exactPickupAddress: 'Artisan Oven, AH Block, Shanti Colony, Anna Nagar, Chennai 600040',
      co2AvoidedKgPerUnit: 1.8,
      wasteDivertedKgPerUnit: 1.0,
      isDemo: true,
      metadata: {
        isVegetarian: true,
        preparedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        temperatureStatus: 'Ambient Room Temp',
        allergens: ['Gluten']
      },
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
            isCover: true,
            displayOrder: 0
          }
        ]
      }
    }
  });

  // --- MODULE 3: INDUSTRIAL SURPLUS ---
  const listingCotton = await prisma.listing.create({
    data: {
      userId: userCoromandel.id,
      module: ListingModule.INDUSTRIAL_SURPLUS,
      title: '500 kg Combed Cotton Fabric Scrap Rolls',
      description: 'High-grade 100% organic combed cotton trimmings and roll ends from apparel export batch. Widths 15-45cm. Ideal for upcycled bags, quilting, baby garments, or acoustic insulation.',
      category: 'Fabric & Textiles',
      status: ListingStatus.ACTIVE,
      isFree: false,
      price: 85,
      priceUnit: 'per_kg',
      depositAmount: 0,
      quantity: 500,
      quantityUnit: 'kg',
      neighborhood: 'Guindy Industrial Estate',
      city: 'Chennai',
      latitude: 13.0125,
      longitude: 80.2080,
      approximateAddress: 'Phase 2, Guindy Industrial Estate (Near SIDCO)',
      exactPickupAddress: 'Warehouse Unit 12B, Guindy Industrial Estate, Chennai 600032',
      co2AvoidedKgPerUnit: 3.4,
      wasteDivertedKgPerUnit: 1.0,
      isDemo: true,
      metadata: {
        materialGrade: 'Export Grade A',
        minOrderQuantity: 50,
        gstInvoiceAvailable: true,
        colorVariety: 'Mixed Natural & Indigo'
      },
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
            isCover: true,
            displayOrder: 0
          }
        ]
      }
    }
  });

  const listingDrums = await prisma.listing.create({
    data: {
      userId: userCoromandel.id,
      module: ListingModule.INDUSTRIAL_SURPLUS,
      title: '40 Food-Grade HDPE Blue Drums (200 Litre)',
      description: 'Triple-rinsed food-grade high-density polyethylene barrels previously holding cold-pressed plant extracts. Includes airtight locking ring lids. Excellent for rainwater harvesting, composting, or bulk storage.',
      category: 'Packaging & Storage',
      status: ListingStatus.ACTIVE,
      isFree: false,
      price: 450,
      priceUnit: 'per_drum',
      depositAmount: 0,
      quantity: 40,
      quantityUnit: 'drums',
      neighborhood: 'Ashok Nagar',
      city: 'Chennai',
      latitude: 13.0360,
      longitude: 80.2150,
      approximateAddress: 'Near Ashok Pillar / 11th Avenue',
      exactPickupAddress: 'Plot 34, 11th Avenue, Ashok Nagar, Chennai 600083',
      co2AvoidedKgPerUnit: 12.0,
      wasteDivertedKgPerUnit: 9.5,
      isDemo: true,
      metadata: {
        materialGrade: 'Food Grade HDPE',
        minOrderQuantity: 2,
        cleanlinessVerified: true,
        capacityLiters: 200
      },
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80',
            isCover: true,
            displayOrder: 0
          }
        ]
      }
    }
  });

  // --- MODULE 4: GREEN MARKETPLACE ---
  const listingTote = await prisma.listing.create({
    data: {
      userId: userEcoKrafts.id,
      module: ListingModule.GREEN_MARKETPLACE,
      title: 'Upcycled Denim Patchwork Tote Bag',
      description: 'Handcrafted tote bag created from post-consumer denim jeans collected in Chennai. Reinforced cotton straps, interior laptop sleeve, and brass magnetic closure. Zero new virgin textiles used.',
      category: 'Upcycled Fashion',
      status: ListingStatus.ACTIVE,
      isFree: false,
      price: 450,
      priceUnit: 'item',
      depositAmount: 0,
      quantity: 8,
      quantityUnit: 'bags',
      neighborhood: 'Adyar',
      city: 'Chennai',
      latitude: 13.0012,
      longitude: 80.2565,
      approximateAddress: 'Near Gandhi Nagar Club, Adyar',
      exactPickupAddress: 'Studio 3, 2nd Main Road, Gandhi Nagar, Adyar, Chennai 600020',
      co2AvoidedKgPerUnit: 6.2,
      wasteDivertedKgPerUnit: 0.85,
      isDemo: true,
      metadata: {
        sustainabilityType: 'Upcycled',
        condition: 'New (Artisanal)',
        handcrafted: true,
        washable: true
      },
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
            isCover: true,
            displayOrder: 0
          }
        ]
      }
    }
  });

  const listingSoap = await prisma.listing.create({
    data: {
      userId: userEcoKrafts.id,
      module: ListingModule.GREEN_MARKETPLACE,
      title: 'Cold-Pressed Herbal Neem & Vetiver Soap Bar (Zero-Waste)',
      description: 'Handmade organic bathing bars made with locally pressed wood-cold neem oil, coconut oil, and wild-harvested Nilgiri vetiver. 100% plastic-free compostable banana paper wrapper.',
      category: 'Zero Waste Living',
      status: ListingStatus.ACTIVE,
      isFree: false,
      price: 130,
      priceUnit: 'bar',
      depositAmount: 0,
      quantity: 25,
      quantityUnit: 'bars',
      neighborhood: 'Velachery',
      city: 'Chennai',
      latitude: 12.9780,
      longitude: 80.2210,
      approximateAddress: 'Near Velachery Phoenix Mall junction',
      exactPickupAddress: 'Door 15, Bypass Road, Velachery, Chennai 600042',
      co2AvoidedKgPerUnit: 1.1,
      wasteDivertedKgPerUnit: 0.25,
      isDemo: true,
      metadata: {
        sustainabilityType: 'Handmade Sustainable',
        condition: 'Brand New',
        ingredients: ['Organic Neem Oil', 'Coconut Oil', 'Vetiver', 'Lye', 'Essential Oils']
      },
      images: {
        create: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&w=800&q=80',
            isCover: true,
            displayOrder: 0
          }
        ]
      }
    }
  });

  console.log('✓ Listings for all 4 modules created successfully');

  // 3. Create Sample Requests, Conversations, Completed Transactions (for Impact stats)
  // Completed Borrow transaction: Karthik borrowed Ananya's drill last week
  const reqBorrowCompleted = await prisma.request.create({
    data: {
      listingId: listingDrill.id,
      requesterId: userKarthik.id,
      ownerId: userAnanya.id,
      status: RequestStatus.COMPLETED,
      requestedQuantity: 1,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      initialMessage: 'Hi Ananya, would love to borrow this drill to mount a couple of wall shelves on Saturday!'
    }
  });

  const txBorrow = await prisma.transaction.create({
    data: {
      requestId: reqBorrowCompleted.id,
      listingId: listingDrill.id,
      providerId: userAnanya.id,
      recipientId: userKarthik.id,
      module: ListingModule.SHARE_BORROW,
      quantityTransacted: 1,
      wasteDivertedKg: 2.8,
      co2AvoidedKg: 14.5,
      estimatedMoneySavedInr: 3200,
      paymentMethod: PaymentMethod.FREE,
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.review.create({
    data: {
      transactionId: txBorrow.id,
      reviewerId: userKarthik.id,
      revieweeId: userAnanya.id,
      rating: 5,
      comment: 'Super helpful! The drill was in mint condition and Ananya even lent me the concrete bits. Saved ₹3,000!'
    }
  });

  // Completed Food Rescue: Robin Hood Army rescued 50 meal boxes yesterday
  const reqFoodCompleted = await prisma.request.create({
    data: {
      listingId: listingMeals.id,
      requesterId: userRHA.id,
      ownerId: userKarthik.id,
      status: RequestStatus.COMPLETED,
      requestedQuantity: 50,
      questionnaireResponses: {
        organizationName: 'Robin Hood Army (NGO)',
        beneficiaryCount: 50,
        intendedRecipients: 'Senior Citizen Shelter in T. Nagar',
        transportArranged: 'Insulated thermal boxes in electric van',
        foodSafetyAccepted: true,
        volunteerContact: '+91 94440 98765'
      },
      initialMessage: 'We have a volunteer team in Adyar ready with temperature-controlled containers to distribute this directly.'
    }
  });

  const txFood = await prisma.transaction.create({
    data: {
      requestId: reqFoodCompleted.id,
      listingId: listingMeals.id,
      providerId: userKarthik.id,
      recipientId: userRHA.id,
      module: ListingModule.FOOD_RESCUE,
      quantityTransacted: 50,
      wasteDivertedKg: 32.5,
      co2AvoidedKg: 105.0,
      estimatedMoneySavedInr: 6000,
      paymentMethod: PaymentMethod.FREE,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  });

  // Active Pending Request: Ananya requests 2 Upcycled Denim Bags from EcoKrafts
  const reqMarketPending = await prisma.request.create({
    data: {
      listingId: listingTote.id,
      requesterId: userAnanya.id,
      ownerId: userEcoKrafts.id,
      status: RequestStatus.PENDING,
      requestedQuantity: 2,
      initialMessage: 'Hi Meera! I love the patchwork design. Can I reserve 2 bags and pick them up tomorrow around 5 PM?'
    }
  });

  // Chat conversation for the pending request
  const convMarket = await prisma.conversation.create({
    data: {
      listingId: listingTote.id,
      requestId: reqMarketPending.id,
      participant1Id: userAnanya.id,
      participant2Id: userEcoKrafts.id,
      lastMessageAt: new Date()
    }
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: convMarket.id,
        senderId: userAnanya.id,
        content: 'Hi Meera! I love the patchwork design. Can I reserve 2 bags and pick them up tomorrow around 5 PM?',
        createdAt: new Date(Date.now() - 35 * 60 * 1000)
      },
      {
        conversationId: convMarket.id,
        senderId: userEcoKrafts.id,
        content: 'Hello Ananya! Absolutely, I have set aside two distinct gradient blue patterns for you. 5 PM at Adyar works great! You can pay via UPI or cash upon pickup.',
        createdAt: new Date(Date.now() - 20 * 60 * 1000)
      },
      {
        conversationId: convMarket.id,
        senderId: userAnanya.id,
        content: 'Sounds perfect, thank you so much! See you tomorrow.',
        createdAt: new Date(Date.now() - 10 * 60 * 1000)
      }
    ]
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: userEcoKrafts.id,
        title: 'New Bag Reservation Request',
        body: 'Ananya requested to reserve 2 Upcycled Denim Bags in Adyar.',
        actionUrl: '/messages',
        isRead: false
      },
      {
        userId: userAnanya.id,
        title: 'Message from Meera (EcoKrafts)',
        body: 'Hello Ananya! Absolutely, I have set aside two distinct gradient blue patterns...',
        actionUrl: '/messages',
        isRead: false
      },
      {
        userId: userRHA.id,
        title: 'Surplus Food Available Nearby',
        body: '70 Fresh Meal Boxes posted in Adyar (2.1 km away).',
        actionUrl: '/explore?module=food_rescue',
        isRead: true
      }
    ]
  });

  // Admin Audit Log
  await prisma.auditLog.create({
    data: {
      adminId: userAdmin.id,
      action: 'ORGANIZATION_VERIFIED',
      targetType: 'USER',
      targetId: userRHA.id,
      details: { organization: 'Robin Hood Army', '80G_doc': 'verified_gov_portal' },
      ipAddress: '127.0.0.1'
    }
  });

  console.log('✓ Seed completed successfully with demo records!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
