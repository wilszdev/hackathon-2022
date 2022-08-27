# Skribbl.AI

**[Skribbl.AI](https://gothic-welder-360715.ts.r.appspot.com) is inspired by popular online game [skribbl.io](https://skribbl.io), but with a twist**
## Made during the *UQCS Hackathon*
# Concept:
Draw based on our prompts, and our AI will give you a score. Compete with your friends in a fun web-based game!

Made with:
* Flask
* Vertex AI (via Tensorflow and Python 3.9)

# How does it work?
You'll be prompted to draw something that our AI has analysed. Skribbl.AI will then save your drawing on the canvas, sending it to be analysed by our custom model trained via Vertex AI, which will then output a score rating how accurate your drawing is to the prompt.

# Usage
1. Clone this repo `git clone https://github.com/wilszdev/skribbl.ai.git`
2. Install dependencies `pip install -r requirements.txt`
3. `gcloud app deploy`
4. `gcloud app browse`
