import pandas as pd
import numpy as np

def generate_financial_model():
    """
    Generates a 24-month financial projection CSV for the Series A Pitch.
    Calculates Cloud Costs, Headcount Burn, B2B Revenue, and Break-Even point.
    """
    months = np.arange(1, 25)
    
    # Baseline Costs
    headcount = np.full(24, 15000) # $15,000/mo team burn
    cloud_base = np.full(24, 2500) # $2,500/mo infra base
    
    # Scale cloud cost slightly as users grow
    cloud_scale = cloud_base + (months * 100) 
    
    # B2B Revenue (Starts at Month 12)
    # Target: 1 client at M12 ($10k), 3 clients by M18 ($30k), 5 by M24 ($50k)
    b2b_revenue = np.zeros(24)
    for i in range(24):
        if i >= 11 and i < 17:
            b2b_revenue[i] = 10000
        elif i >= 17 and i < 23:
            b2b_revenue[i] = 30000
        elif i >= 23:
            b2b_revenue[i] = 50000
            
    # B2G Revenue (Starts at Month 18)
    b2g_revenue = np.zeros(24)
    for i in range(17, 24):
        b2g_revenue[i] = 8300 # ~$100k annual contract
        
    total_revenue = b2b_revenue + b2g_revenue
    total_costs = headcount + cloud_scale
    net_burn = total_revenue - total_costs
    
    df = pd.DataFrame({
        "Month": months,
        "Total_Revenue": total_revenue,
        "Headcount_Costs": headcount,
        "Cloud_Costs": cloud_scale,
        "Total_Costs": total_costs,
        "Net_Cash_Flow": net_burn
    })
    
    df.to_csv("financial_projections.csv", index=False)
    print("Successfully generated financial_projections.csv")
    
if __name__ == "__main__":
    generate_financial_model()
