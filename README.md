# Skribbl.AI

Our [skribbl.io](https://skribbl.io)-inspired project built for the UQCS Hackathon 2022, awarded Best Newcomers.

We trained an AI to recognise drawings and give them a score. [Put your doodling skills to the test](https://gothic-welder-360715.ts.r.appspot.com) in our fun web-based game!

## How does it work?
You'll be prompted to draw something. Once the timer finishes (or if you click 'skip') we send your drawing to our AI, which will judge the image against the prompt and produce a confidence value that we use to calculate your score.

## Technologies

* Frontend: mostly vanilla Javascript, bit of jQuery in there
* Backend: Flask
* Hosting: Google Cloud (App Engine and Vertex AI)
