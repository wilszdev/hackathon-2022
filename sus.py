import os
import base64
from google.cloud import aiplatform
from google.cloud.aiplatform.gapic.schema import predict


credential_path = os.path.abspath("keyfile.json")
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credential_path


class SusClient:
    def __init__(
        self,
        project: str,
        endpoint_id: str,
        location: str = "us-central1",
        api_endpoint: str = "us-central1-aiplatform.googleapis.com"
    ):
        self.project = project
        self.location = location
        self.endpoint_id = endpoint_id
        self.client_options = {"api_endpoint": api_endpoint}
        self.client = aiplatform.gapic.PredictionServiceClient(
            client_options=self.client_options)

    def predict(self, file_bytes):
        encoded_content = base64.b64encode(file_bytes).decode('utf-8')
        instance = predict.instance.ImageClassificationPredictionInstance(
            content=encoded_content
        ).to_value()

        instances = [instance]

        parameters = predict.params.ImageClassificationPredictionParams(
            confidence_threshold=0.25, max_predictions=5
        ).to_value()

        endpoint = self.client.endpoint_path(
            project=self.project,
            location=self.location,
            endpoint=self.endpoint_id
        )

        response = self.client.predict(
            endpoint=endpoint, instances=instances, parameters=parameters
        )

        # dict looks like this:
        #
        #   {
        #       'confidences': [0.5, 0.3, 0.2],
        #       'displayNames': [],
        #       'ids': []
        #   }

        assert len(response.predictions) == 1

        prediction = dict(next(iter(response.predictions)))

        payload = {}
        for i in range(len(prediction['displayNames'])):
            name = prediction['displayNames'][i]
            confidence = prediction['confidences'][i]
            payload.update({name: confidence})

        return payload
