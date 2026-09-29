import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getPersonalImpact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const userId = req.user.id;

    // Get all transactions where user was either provider or recipient
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { providerId: userId },
          { recipientId: userId },
        ],
      },
      include: {
        listing: {
          select: { title: true, module: true, category: true },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    // Aggregate real metrics from database
    let totalWasteDivertedKg = 0;
    let totalCo2AvoidedKg = 0;
    let totalMoneySavedInr = 0;
    let totalItemsCirculated = transactions.length;

    let itemsShared = 0;
    let foodRescuedCount = 0;
    let surplusRecoveredKg = 0;
    let productsReused = 0;

    // Monthly breakdown data for current year
    const monthlyMap: Record<string, { wasteKg: number; co2Kg: number; count: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((m) => {
      monthlyMap[m] = { wasteKg: 0, co2Kg: 0, count: 0 };
    });

    transactions.forEach((tx) => {
      const waste = Number(tx.wasteDivertedKg) || 0;
      const co2 = Number(tx.co2AvoidedKg) || 0;
      const money = Number(tx.estimatedMoneySavedInr) || 0;
      const qty = Number(tx.quantityTransacted) || 1;

      totalWasteDivertedKg += waste;
      totalCo2AvoidedKg += co2;
      totalMoneySavedInr += money;

      if (tx.module === 'SHARE_BORROW') itemsShared += 1;
      else if (tx.module === 'FOOD_RESCUE') foodRescuedCount += qty;
      else if (tx.module === 'INDUSTRIAL_SURPLUS') surplusRecoveredKg += qty;
      else if (tx.module === 'GREEN_MARKETPLACE') productsReused += qty;

      const date = new Date(tx.completedAt);
      const monthName = months[date.getMonth()];
      if (monthlyMap[monthName]) {
        monthlyMap[monthName].wasteKg += waste;
        monthlyMap[monthName].co2Kg += co2;
        monthlyMap[monthName].count += 1;
      }
    });

    const monthlyBreakdown = months.map((m) => ({
      month: m,
      wasteKg: Math.round(monthlyMap[m].wasteKg * 10) / 10,
      co2Kg: Math.round(monthlyMap[m].co2Kg * 10) / 10,
      exchanges: monthlyMap[m].count,
    }));

    res.json({
      summary: {
        totalItemsCirculated,
        totalWasteDivertedKg: Math.round(totalWasteDivertedKg * 10) / 10,
        totalCo2AvoidedKg: Math.round(totalCo2AvoidedKg * 10) / 10,
        totalMoneySavedInr: Math.round(totalMoneySavedInr),
        itemsShared,
        foodRescuedCount,
        surplusRecoveredKg,
        productsReused,
      },
      monthlyBreakdown,
      recentTransactions: transactions.slice(0, 5),
      methodology: {
        wasteAvoided: 'Calculated using product weight benchmarks and direct quantity metrics diverted from municipal landfills.',
        co2Avoided: 'Estimated lifecycle emission reduction factors derived from EPA WARM (Waste Reduction Model) and Ellen MacArthur Foundation circular economy indices (1.5 kg CO2e / kg general materials, 2.1 kg CO2e / cooked meal, 14.5 kg CO2e / power tool lifecycle).',
        disclaimer: 'All carbon reduction figures are verified estimates based on recognized lifecycle assessment (LCA) methodologies.',
      },
    });
  } catch (error) {
    console.error('Get personal impact error:', error);
    res.status(500).json({ message: 'Server error retrieving personal impact.' });
  }
};

export const getCommunityImpact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { neighborhood } = req.query;

    const where: any = {};
    if (neighborhood && typeof neighborhood === 'string' && neighborhood !== 'All') {
      where.listing = { neighborhood };
    }

    const allTransactions = await prisma.transaction.findMany({
      where,
      include: {
        listing: {
          select: { neighborhood: true, module: true },
        },
      },
    });

    let totalWasteKg = 0;
    let totalCo2Kg = 0;
    let totalMoneyInr = 0;
    let totalExchanges = allTransactions.length;

    let foodMealsCount = 0;
    let toolsCirculated = 0;
    let industrialKg = 0;
    let marketProducts = 0;

    const neighborhoodMap: Record<string, { wasteKg: number; exchanges: number }> = {
      'Anna Nagar': { wasteKg: 0, exchanges: 0 },
      'Ashok Nagar': { wasteKg: 0, exchanges: 0 },
      'Guindy': { wasteKg: 0, exchanges: 0 },
      'Guindy Industrial Estate': { wasteKg: 0, exchanges: 0 },
      'Adyar': { wasteKg: 0, exchanges: 0 },
      'Velachery': { wasteKg: 0, exchanges: 0 },
      'T. Nagar': { wasteKg: 0, exchanges: 0 },
    };

    allTransactions.forEach((tx) => {
      const waste = Number(tx.wasteDivertedKg) || 0;
      const co2 = Number(tx.co2AvoidedKg) || 0;
      const money = Number(tx.estimatedMoneySavedInr) || 0;
      const qty = Number(tx.quantityTransacted) || 1;

      totalWasteKg += waste;
      totalCo2Kg += co2;
      totalMoneyInr += money;

      if (tx.module === 'SHARE_BORROW') toolsCirculated += 1;
      else if (tx.module === 'FOOD_RESCUE') foodMealsCount += qty;
      else if (tx.module === 'INDUSTRIAL_SURPLUS') industrialKg += qty;
      else if (tx.module === 'GREEN_MARKETPLACE') marketProducts += qty;

      const nHood = tx.listing.neighborhood;
      if (neighborhoodMap[nHood]) {
        neighborhoodMap[nHood].wasteKg += waste;
        neighborhoodMap[nHood].exchanges += 1;
      }
    });

    // Also get active platform stats
    const activeListingsCount = await prisma.listing.count({ where: { status: 'ACTIVE' } });
    const registeredUsersCount = await prisma.user.count({ where: { isBanned: false } });

    res.json({
      community: {
        totalExchanges,
        totalWasteKg: Math.round(totalWasteKg * 10) / 10,
        totalCo2Kg: Math.round(totalCo2Kg * 10) / 10,
        totalMoneyInr: Math.round(totalMoneyInr),
        activeListingsCount,
        registeredUsersCount,
        foodMealsCount,
        toolsCirculated,
        industrialKg,
        marketProducts,
      },
      neighborhoodBreakdown: Object.keys(neighborhoodMap).map((name) => ({
        neighborhood: name,
        wasteKg: Math.round(neighborhoodMap[name].wasteKg * 10) / 10,
        exchanges: neighborhoodMap[name].exchanges,
      })),
    });
  } catch (error) {
    console.error('Get community impact error:', error);
    res.status(500).json({ message: 'Server error retrieving community impact.' });
  }
};
