import { NextRequest, NextResponse } from 'next/server';
import { MongoService } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const plans = await MongoService.jsonGet('admin:plans');
    return NextResponse.json({ plans: plans || [] });
  } catch (error) {
    console.error('Failed to fetch plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, planId, data } = body;

    switch (action) {
      case 'update_status':
        const plans = await MongoService.jsonGet('admin:plans') || [];
        const updatedPlans = plans.map((plan: any) => {
          if (plan.id === planId) {
            return { ...plan, status: data.status };
          }
          return plan;
        });
        
        await MongoService.jsonSet('admin:plans', '$', updatedPlans);
        return NextResponse.json({ success: true, plans: updatedPlans });

      case 'update_user_count':
        const currentPlans = await MongoService.jsonGet('admin:plans') || [];
        const plansWithUpdatedCount = currentPlans.map((plan: any) => {
          if (plan.id === planId) {
            return { ...plan, userCount: data.userCount };
          }
          return plan;
        });
        
        await MongoService.jsonSet('admin:plans', '$', plansWithUpdatedCount);
        return NextResponse.json({ success: true, plans: plansWithUpdatedCount });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Failed to update plan:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}
