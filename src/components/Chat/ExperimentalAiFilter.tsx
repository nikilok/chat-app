import styles from "./ExperimentalAiFilter.module.css";
import Toggle from "react-toggle";
import "react-toggle/style.css";

interface ExperimentalAiFilterProps {
	isEnabled: boolean;
	onToggle: (enabled: boolean) => void;
}

export default function ExperimentalAiFilter({
	isEnabled,
	onToggle,
}: ExperimentalAiFilterProps) {
	return (
		<div className={styles.aiFilterContainer}>
			<div className={styles.toggleWrapper}>
				<span className={styles.labelText}>AI Language Filtering</span>
				<Toggle
					checked={isEnabled}
					icons={false}
					onChange={(e) => onToggle(e.target.checked)}
				/>
			</div>
		</div>
	);
}
