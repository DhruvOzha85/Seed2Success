# Seed2Success: 100 Investor & Judge Questions (Q&A)

*This is a curated subset of the most brutal questions you will face during a VC pitch.*

## Technology & AI
**Q1: What stops Microsoft from copying this tomorrow?**
**A1:** Microsoft has unlimited engineers, but they do not have our proprietary, localized dataset. Our MLOps pipeline creates a Continuous Learning feedback loop. Every day a farmer uses our app, our model gets mathematically smarter. By the time Microsoft launches a clone, our model will be 24 months ahead in accuracy.

**Q2: LLMs are notoriously expensive. How do you handle inference costs at scale?**
**A2:** We use Semantic Caching (Redis). If 1,000 farmers ask "How to treat rust?", the LLM only generates the answer once. The other 999 get the cached response instantly for zero cost. 

**Q3: How do you handle farmers without internet access?**
**A3:** Currently, our ML inference requires 4G. However, our 2-year roadmap involves compressing the Random Forest and CNN Vision models to run natively on the Android Edge (TensorFlow Lite), making the core features 100% offline-capable.

## Business & Market
**Q4: You're offering the app for free. How are you not just burning money?**
**A4:** The free app is our Customer Acquisition Cost (CAC) to build the dataset. The real product isn't the app; it's the API. We monetize by selling access to our predictive models to Crop Insurance companies who desperately need our data to underwrite loans.

**Q5: Smallholder farmers don't trust tech. How do you get them to use this?**
**A5:** We don't sell to them directly. We use a B2B2C model, partnering with local Farmer Cooperatives and NGOs who already have deep, generational trust with the farmers.

**Q6: What happens if your model gives bad advice and a crop fails? Are you liable?**
**A6:** Our Terms of Service explicitly state we are a "Copilot," not a replacement for professional agronomists. Furthermore, we use strict LLM Guardrails to prevent the AI from generating unverified chemical advice.
