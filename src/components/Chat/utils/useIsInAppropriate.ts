import "@tensorflow/tfjs";
import * as toxicity from "@tensorflow-models/toxicity";

type Result = {
	probabilities: Float32Array;
	match: boolean;
};

type Prediction = {
	label: string;
	results: Result[];
};

type PredictionsResponse = Prediction[];

const threshold: number = 0.85;
/**
 * This function uses a local AI model trained in detecting inappropriate content
 * @param sentence string
 * @returns boolean
 */
export default async function isInAppropriate(
	sentence: string,
): Promise<boolean> {
	const model = await toxicity.load(threshold, []);
	const predictions: PredictionsResponse = await model.classify(sentence);
	// console.log("🚀 ~ isInAppropriate ~ predictions:", predictions)

	return predictions.some((prediction) =>
		prediction.results.some((result) => result.match),
	);
}
