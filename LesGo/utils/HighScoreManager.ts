import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HighScoreEntry {
    playerName: string;
    score: number;
    date: string; // ISO Date string
}

const STORAGE_KEY_PREFIX = 'lesgo_highscore_';

export const getHighScores = async (gameId: string): Promise<HighScoreEntry[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${gameId}`);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Error reading high scores', e);
        return [];
    }
};

export const saveScore = async (
    gameId: string,
    entry: HighScoreEntry,
    isHigherBetter: boolean = true
): Promise<boolean> => {
    try {
        const currentScores = await getHighScores(gameId);
        const newScores = [...currentScores, entry];

        // Sort based on game type
        newScores.sort((a, b) => {
            if (isHigherBetter) {
                return b.score - a.score; // Descending
            } else {
                return a.score - b.score; // Ascending (Time based)
            }
        });

        // Keep top 5
        const top5 = newScores.slice(0, 5);

        // Save
        await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${gameId}`, JSON.stringify(top5));

        // Check if our new entry made it to the top 5
        const isNewRecord = top5.some(s => s.date === entry.date && s.playerName === entry.playerName && s.score === entry.score);
        return isNewRecord;

    } catch (e) {
        console.error('Error saving high score', e);
        return false;
    }
};

export const clearScores = async (gameId: string) => {
    try {
        await AsyncStorage.removeItem(`${STORAGE_KEY_PREFIX}${gameId}`);
    } catch (e) {
        console.error('Error clearing high scores', e);
    }
};
