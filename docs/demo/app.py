import streamlit as st
import time
import random

# Page Config
st.set_page_config(page_title="Seed2Success Investor Demo", page_icon="🌾", layout="wide")

# Styling
st.markdown("""
    <style>
    .main { background-color: #f8fafc; }
    .stButton>button { background-color: #16a34a; color: white; border-radius: 8px; width: 100%; }
    .stButton>button:hover { background-color: #15803d; }
    </style>
""", unsafe_allow_html=True)

st.title("🌾 Seed2Success: AI Agriculture Operating System")
st.subheader("Investor / Hackathon Live Demo")

st.write("---")

col1, col2 = st.columns(2)

with col1:
    st.header("1. Disease Detection (Vision AI)")
    uploaded_file = st.file_uploader("Upload an image of a diseased crop leaf", type=["jpg", "png"])
    
    if uploaded_file is not None:
        st.image(uploaded_file, caption="Uploaded Leaf", use_container_width=True)
        if st.button("Run Disease Diagnosis"):
            with st.spinner("Analyzing with Convolutional Neural Network..."):
                time.sleep(2) # Simulate API call latency
                st.success(f"**Diagnosis:** Early Blight detected (Confidence: 94.2%)")
                st.warning("Action required immediately to prevent 15% yield loss.")

with col2:
    st.header("2. Yield Prediction (ML)")
    lat = st.number_input("Latitude", value=28.7041)
    lon = st.number_input("Longitude", value=77.1025)
    
    if st.button("Predict Optimal Crop & Yield"):
        with st.spinner("Pulling SoilGrids & Weather APIs, running Random Forest..."):
            time.sleep(2)
            st.success("**Optimal Crop:** Wheat")
            st.metric(label="Predicted Yield", value="4.2 Tons/Ha", delta="+0.4 Tons (vs regional avg)")
            
            st.write("**SHAP Explainability:**")
            st.progress(0.8, text="Soil Nitrogen (High impact)")
            st.progress(0.6, text="Expected Rainfall (Moderate impact)")

st.write("---")

st.header("3. RAG Agronomy Copilot (Voice-Ready)")
prompt = st.text_input("Ask the AI Agronomist (e.g., 'How do I treat Early Blight?')")

if st.button("Send to Enterprise Intelligence Layer"):
    if prompt:
        with st.spinner("Routing intent, searching Vector DB, generating response..."):
            time.sleep(2.5)
            st.info("🎙️ (Text-to-Speech Output Generating...)")
            st.write("**Copilot:** Based on your local soil conditions and the detected Early Blight, you should apply a Copper-based fungicide within the next 48 hours before the forecasted rain hits on Thursday.")
    else:
        st.error("Please enter a question.")
        
st.write("---")
st.caption("Powered by Seed2Success Continuous Learning MLOps Engine.")
