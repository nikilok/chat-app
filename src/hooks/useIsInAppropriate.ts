import "@tensorflow/tfjs";
import * as toxicity from "@tensorflow-models/toxicity";
import { useState } from "react";
import * as emoji from "node-emoji";

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
async function getPredicion(sentence: string): Promise<boolean> {
	const model = await toxicity.load(threshold, []);
	const predictions: PredictionsResponse = await model.classify(sentence);
	// console.log("🚀 ~ isInAppropriate ~ predictions:", predictions)

	return predictions.some((prediction) =>
		prediction.results.some((result) => result.match),
	);
}

export function useIsInAppropriate() {
	const [isLoading, setIsLoading] = useState(false);

	const isInAppropriate = async (sentence: string): Promise<boolean> => {
		setIsLoading(true);
		try {
			const emojiToText = emoji.unemojify(sentence).replaceAll(":", "");
			const response = await getPredicion(emojiToText);
			setIsLoading(false);
			return response;
		} catch (_) {
			setIsLoading(false);
			return false;
		}
	};

	return {
		isLoading,
		isInAppropriate,
	};
}
