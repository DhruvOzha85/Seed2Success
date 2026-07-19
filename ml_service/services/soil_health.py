import numpy as np

def calculate_soil_health_score(soil_data: dict) -> dict:
    """
    Calculates an agronomic Soil Health Score based on industry standard indicators
    (similar to Cornell Comprehensive Assessment of Soil Health scoring logic).
    """
    ph = soil_data.get("ph", 6.5)
    soc = soil_data.get("soc", 1.0)
    nitrogen = soil_data.get("nitrogen", 20.0)
    cec = soil_data.get("cec", 15.0)
    bulk_density = soil_data.get("bulk_density", 1.3)
    
    # 1. pH Score (Optimum 6.0 - 7.0)
    if 6.0 <= ph <= 7.0:
        ph_score = 100
    elif 5.5 <= ph < 6.0 or 7.0 < ph <= 7.5:
        ph_score = 80
    elif 5.0 <= ph < 5.5 or 7.5 < ph <= 8.0:
        ph_score = 50
    else:
        ph_score = 20
        
    # 2. SOC Score (More is better, plateau around 3-4%)
    soc_score = min(100, max(0, int((soc / 3.0) * 100)))
    if soc_score < 20: soc_score = 20
    
    # 3. Nitrogen Score
    n_score = min(100, max(20, int((nitrogen / 50.0) * 100)))
    
    # 4. CEC Score
    cec_score = min(100, max(20, int((cec / 25.0) * 100)))
    
    # 5. Bulk Density Score (Lower is better, root restriction > 1.6)
    if bulk_density <= 1.25:
        bd_score = 100
    elif 1.25 < bulk_density <= 1.45:
        bd_score = 80
    elif 1.45 < bulk_density <= 1.6:
        bd_score = 50
    else:
        bd_score = 20
        
    # Weighted Average
    weights = {
        "ph": 0.25,
        "soc": 0.30,
        "nitrogen": 0.15,
        "cec": 0.15,
        "bulk_density": 0.15
    }
    
    overall_score = int(
        (ph_score * weights["ph"]) + 
        (soc_score * weights["soc"]) + 
        (n_score * weights["nitrogen"]) + 
        (cec_score * weights["cec"]) + 
        (bd_score * weights["bulk_density"])
    )
    
    if overall_score >= 80:
        category = "Excellent"
    elif overall_score >= 60:
        category = "Good"
    elif overall_score >= 40:
        category = "Fair"
    else:
        category = "Poor"
        
    return {
        "overall_score": overall_score,
        "category": category,
        "metrics": {
            "ph_score": ph_score,
            "soc_score": soc_score,
            "nitrogen_score": n_score,
            "cec_score": cec_score,
            "bulk_density_score": bd_score
        }
    }
