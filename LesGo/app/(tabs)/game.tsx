import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Modal, useColorScheme, TextInput, ScrollView, Switch } from 'react-native';
import { Text, View } from '@/components/Themed';
import { GAME_CARDS, Card } from '@/constants/GameData';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import VictoryScreen from '@/components/game/VictoryScreen';
import InfoModal from '@/components/game/InfoModal';
import TimerModal from '@/components/game/TimerModal';
import GameCard from '@/components/game/GameCard';
import RouletteModal from '@/components/game/RouletteModal';
import BrickBreaker from '@/components/game/minigames/BrickBreaker';
import FlappyDrink from '@/components/game/minigames/FlappyDrink';
import FortuneRoulette from '@/components/game/minigames/FortuneRoulette';
import FastTapper from '@/components/game/minigames/FastTapper';
import MemoryChallenge from '@/components/game/minigames/MemoryChallenge';
import ReflexDuel from '@/components/game/minigames/ReflexDuel';
import StopTheBus from '@/components/game/minigames/StopTheBus';
import GiftBox from '@/components/game/minigames/GiftBox';

// Fisher-Yates Shuffle Algorithm
const shuffleArray = (array: Card[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// Helper: Format card text with dynamic names
const formatCardText = (text: string, players: string[], currentPlayer: string) => {
    if (!text.includes('{player}')) return text;

    // Get other players
    const others = players.filter(p => p !== currentPlayer);
    if (others.length === 0) return text.replace('{player}', 'alguien');

    // Pick random player
    const randomPlayer = others[Math.floor(Math.random() * others.length)];
    return text.replace('{player}', randomPlayer);
};

// Helper: Haptics
const playHaptic = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    switch (style) {
        case 'light': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); break;
        case 'medium': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); break;
        case 'heavy': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); break;
    }
};

export default function GameScreen() {
    const [gameState, setGameState] = useState<'config' | 'setup' | 'playing' | 'victory'>('setup');
    const [players, setPlayers] = useState<string[]>([]);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

    const [deck, setDeck] = useState<Card[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [drinkMessage, setDrinkMessage] = useState('¡BEBE!'); // Initial default

    // Points system
    const [playerScores, setPlayerScores] = useState<Record<string, number>>({});
    const [direction, setDirection] = useState<1 | -1>(1); // 1 = forward, -1 = backward
    const [doublePoints, setDoublePoints] = useState(false);
    const [skipNext, setSkipNext] = useState(false);
    const [showScoreboard, setShowScoreboard] = useState(false);
    const [showConfig, setShowConfig] = useState(false);

    // Player selection modal for steal/gift effects
    const [playerSelectionModal, setPlayerSelectionModal] = useState(false);
    const [selectionAction, setSelectionAction] = useState<'steal' | 'gift' | null>(null);
    const [winner, setWinner] = useState<string | null>(null);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [currentRound, setCurrentRound] = useState(1);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [targetScore, setTargetScore] = useState(30);
    const [usedCardIds, setUsedCardIds] = useState<string[]>([]); // Track used card IDs

    // Timer State
    const [timerVisible, setTimerVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);
    const [timerActive, setTimerActive] = useState(false);

    // Roulette State
    const [showRoulette, setShowRoulette] = useState(false);
    const [isRouletteMode, setIsRouletteMode] = useState(false);
    const [pendingRouletteAction, setPendingRouletteAction] = useState<'turn' | 'effect'>('turn');
    const [showBrickBreaker, setShowBrickBreaker] = useState(false);
    const [showFlappyDrink, setShowFlappyDrink] = useState(false);
    const [showFortuneRoulette, setShowFortuneRoulette] = useState(false);
    const [showFastTapper, setShowFastTapper] = useState(false);
    const [showMemoryChallenge, setShowMemoryChallenge] = useState(false);
    const [showReflexDuel, setShowReflexDuel] = useState(false);
    const [showStopTheBus, setShowStopTheBus] = useState(false);
    const [showGiftBox, setShowGiftBox] = useState(false);
    const [isArcadeMode, setIsArcadeMode] = useState(false);
    const [isMinigameOnlyMode, setIsMinigameOnlyMode] = useState(false);


    // Timer Effect
    useEffect(() => {
        let interval: any;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && timerActive) {
            setTimerActive(false);
            playHaptic('heavy');
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const startTimer = (seconds: number) => {
        setTimeLeft(seconds);
        setTimerActive(true);
        setTimerVisible(true);
    };

    // Game configuration
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['romantic', 'spicy', 'fun', 'general']);
    const [selectedIntensity, setSelectedIntensity] = useState<'soft' | 'medium' | 'spicy'>('medium');

    // Custom cards
    const [customCards, setCustomCards] = useState<Card[]>([]);
    const [showCustomCardModal, setShowCustomCardModal] = useState(false);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [newCustomCard, setNewCustomCard] = useState<Card>({
        id: '',
        text: '',
        type: 'question',
        mode: 'binary',
        category: 'general',
        intensity: 'medium',
    });

    const colorScheme = useColorScheme();

    const isDark = colorScheme === 'dark';
    const colors = {
        orange: '#FF6B35',
        lightOrange: '#FF9A56',
        gold: '#FFD700',
        white: '#FFFFFF',
        pink: '#E91E8C',
        darkPink: '#C2185B',
        purple: '#9C27B0',
        text: isDark ? '#fff' : '#1a1a1a',
        cardBackground: isDark ? '#2d1b2e' : '#fff',
        inputBackground: isDark ? '#3d2a3e' : '#f0f0f0',
        modalBackground: isDark ? '#1a0f1b' : '#ffffff',
        accentGradient: isDark ? 'rgba(233, 30, 140, 0.2)' : 'rgba(233, 30, 140, 0.1)',
    };

    // --- Setup Logic ---
    const addPlayer = async () => {
        if (newPlayerName.trim().length > 0) {
            const updatedPlayers = [...players, newPlayerName.trim()];
            setPlayers(updatedPlayers);
            setNewPlayerName('');
            // Save to AsyncStorage
            await savePlayersToStorage(updatedPlayers);
        }
    };

    const removePlayer = async (index: number) => {
        const updatedPlayers = players.filter((_, i) => i !== index);
        setPlayers(updatedPlayers);
        // Save to AsyncStorage
        await savePlayersToStorage(updatedPlayers);
    };

    // AsyncStorage functions
    const savePlayersToStorage = async (playersList: string[]) => {
        try {
            await AsyncStorage.setItem('lesgo_players', JSON.stringify(playersList));
        } catch (error) {
            console.error('Error saving players:', error);
        }
    };

    const loadPlayersFromStorage = async () => {
        try {
            const savedPlayers = await AsyncStorage.getItem('lesgo_players');
            if (savedPlayers) {
                setPlayers(JSON.parse(savedPlayers));
            }
        } catch (error) {
            console.error('Error loading players:', error);
        }
    };

    // Custom Cards AsyncStorage functions
    const saveCustomCardsToStorage = async (cards: Card[]) => {
        try {
            await AsyncStorage.setItem('lesgo_custom_cards', JSON.stringify(cards));
        } catch (error) {
            console.error('Error saving custom cards:', error);
        }
    };

    const loadCustomCardsFromStorage = async () => {
        try {
            const savedCards = await AsyncStorage.getItem('lesgo_custom_cards');
            if (savedCards) {
                setCustomCards(JSON.parse(savedCards));
            }
        } catch (error) {
            console.error('Error loading custom cards:', error);
        }
    };

    const addCustomCard = async () => {
        if (!newCustomCard.text.trim()) return;

        let updatedCards;
        if (newCustomCard.id) {
            // Edit existing card
            updatedCards = customCards.map(c => c.id === newCustomCard.id ? newCustomCard : c);
        } else {
            // Create new card
            const newCard: Card = {
                ...newCustomCard,
                id: Date.now().toString(),
            };
            updatedCards = [...customCards, newCard];
        }

        setCustomCards(updatedCards);
        await saveCustomCardsToStorage(updatedCards);

        // Reset form
        setNewCustomCard({
            id: '',
            text: '',
            type: 'question',
            mode: 'binary',
            category: 'general',
            intensity: 'medium',
        });
        // Don't close modal automatically in edit mode to let user see result, or close? 
        // User flow: edit -> save -> clear form. Maybe keep open or close? Let's close for now to be consistent.
        // Actually, user might want to add more. But consistent behavior is close.
        // But for "Edit", it feels like "Done".
        // Let's keep it consistent: always clear and close? Or just clear.
        // Current behavior was: clear and close.
        setShowCustomCardModal(false);
    };

    const deleteCustomCard = async (id: string) => {
        const updatedCards = customCards.filter(card => card.id !== id);
        setCustomCards(updatedCards);
        await saveCustomCardsToStorage(updatedCards);
    };

    const editCustomCard = (card: Card) => {
        setNewCustomCard(card);
    };

    const cancelEdit = () => {
        setNewCustomCard({
            id: '',
            text: '',
            type: 'question',
            mode: 'binary',
            category: 'general',
            intensity: 'medium',
        });
    };

    // Load players and custom cards on component mount
    useEffect(() => {
        loadPlayersFromStorage();
        loadCustomCardsFromStorage();
    }, []);

    const startGame = () => {
        if (players.length > 0) {
            // Filter cards based on configuration
            const intensityLevels = { 'soft': 1, 'medium': 2, 'spicy': 3 };
            const selectedLevel = intensityLevels[selectedIntensity];

            const allCards = [...GAME_CARDS, ...customCards];

            const filteredCards = allCards.filter(card => {
                const cardCategory = card.category || 'general';
                const cardIntensity = card.intensity || 'medium';
                const cardLevel = intensityLevels[cardIntensity] || 2; // Default to medium

                // Category check
                const categoryMatch = selectedCategories.includes(cardCategory);
                // Intensity check
                const intensityMatch = cardLevel <= selectedLevel;
                // Round 1 filter: No special effects
                const round1Match = !card.specialEffect;

                return categoryMatch && intensityMatch && round1Match;
            });

            // Ensure we have at least some cards
            const deckToUse = filteredCards.length > 0 ? filteredCards : allCards.filter(c => !c.specialEffect);

            setDeck(shuffleArray(deckToUse));
            setCurrentCardIndex(0);
            setCurrentPlayerIndex(0);
            setCurrentRound(1);
            setTargetScore(30);
            setUsedCardIds([]);

            // Initialize scores
            const initialScores: Record<string, number> = {};
            players.forEach(player => initialScores[player] = 0);
            setPlayerScores(initialScores);
            setDirection(1);
            setDoublePoints(false);
            setSkipNext(false);
            setWinner(null);
            setGameState('playing');

            // Trigger initial minigame if specific mode is active
            if (isMinigameOnlyMode) {
                setTimeout(() => {
                    triggerRandomMinigame();
                }, 600); // Slight delay to allow transition
            }
        }
    };

    const resetGame = () => {
        setShowExitConfirm(false);
        setGameState('setup');
        // Keep players list
        setCurrentPlayerIndex(0);
        setPlayerScores({});
        setDirection(1);
        setDoublePoints(false);
        setSkipNext(false);
        setWinner(null);
        setCurrentRound(1);
        setTargetScore(30);
        setUsedCardIds([]);
        setPendingMinigame(null); // Clear pending minigame
    };

    const handleExitClick = () => {
        if (gameState === 'playing') {
            setShowExitConfirm(true);
        } else {
            resetGame();
        }
    };

    const continueGame = () => {
        setTargetScore(prev => prev + 30);
        setGameState('playing');
        setWinner(null);
    };

    // --- Game Logic ---
    // Ensure deck has cards, fallback to base list if empty (shouldn't happen after start)
    const activeDeck = deck.length > 0 ? deck : GAME_CARDS;
    const currentCard: Card = activeDeck[currentCardIndex % activeDeck.length];
    const currentPlayer = players[currentPlayerIndex];

    // Helper to get fresh candidates based on config and round
    const getCardCandidates = (isRound2Plus: boolean) => {
        const intensityLevels = { 'soft': 1, 'medium': 2, 'spicy': 3 };
        const selectedLevel = intensityLevels[selectedIntensity];
        const allCards = [...GAME_CARDS, ...customCards];

        return allCards.filter(card => {
            const cardCategory = card.category || 'general';
            const cardIntensity = card.intensity || 'medium';
            const cardLevel = intensityLevels[cardIntensity] || 2;

            const categoryMatch = selectedCategories.includes(cardCategory);
            const intensityMatch = cardLevel <= selectedLevel;
            const roundMatch = isRound2Plus ? true : !card.specialEffect;

            return categoryMatch && intensityMatch && roundMatch;
        });
    };

    const handleRouletteWinner = (winner: string) => {
        // Update current player to the winner
        const winnerIndex = players.indexOf(winner);
        if (winnerIndex !== -1) {
            setCurrentPlayerIndex(winnerIndex);
        }
        setShowRoulette(false);

        // Trigger haptic for result
        playHaptic('heavy');
    };

    const handleFortuneResult = (result: any) => {
        setShowFortuneRoulette(false);
        if (!result) return;

        const currentPlayer = players[currentPlayerIndex];

        // Process Result
        if (result.type === 'points') {
            const points = result.value;
            setPlayerScores(prev => ({
                ...prev,
                [currentPlayer]: Math.max(0, (prev[currentPlayer] || 0) + points)
            }));
            // Show toast or modal? TimerModal used for general info sometimes
            // For now, let's just rely on the Roulette's own result modal which the user already saw.
        } else if (result.type === 'steal') {
            // Steal 5 points from top player (excluding self)
            let topPlayer = '';
            let maxScore = -1;

            Object.entries(playerScores).forEach(([p, score]) => {
                if (p !== currentPlayer && score > maxScore) {
                    maxScore = score;
                    topPlayer = p;
                }
            });

            if (topPlayer && maxScore > 0) {
                const stealAmount = Math.min(maxScore, 5);
                setPlayerScores(prev => ({
                    ...prev,
                    [topPlayer]: prev[topPlayer] - stealAmount,
                    [currentPlayer]: (prev[currentPlayer] || 0) + stealAmount
                }));
            }
        }
        // 'drink' and 'challenge' are self-explanatory actions shown on the wheel results

        // Advance Turn
        nextTurn();
    };

    const [pendingMinigame, setPendingMinigame] = useState<{
        key: string;
        name: string;
        description: string;
        icon: string;
        onPlay: () => void;
    } | null>(null);

    // ... existing states ...

    const triggerRandomMinigame = () => {
        const minigames = [
            { key: 'brick', name: 'Brick Breaker 🧱', description: 'Rompe los ladrillos para ganar puntos.', icon: 'th-large', action: () => setShowBrickBreaker(true) },
            { key: 'flappy', name: 'Flappy Drink 🐦', description: 'Esquiva las botellas y llega lejos.', icon: 'plane', action: () => setShowFlappyDrink(true) },
            { key: 'roulette', name: 'Ruleta de la Fortuna 🎰', description: 'Prueba tu suerte.', icon: 'circle-o-notch', action: () => setShowFortuneRoulette(true) },
            { key: 'tapper', name: 'Fast Tapper 👆', description: 'Toca lo más rápido posible.', icon: 'hand-pointer-o', action: () => setShowFastTapper(true) },
            { key: 'memory', name: 'Memory Challenge 🧠', description: 'Encuentra las parejas.', icon: 'lightbulb-o', action: () => setShowMemoryChallenge(true) },
            { key: 'reflex', name: 'Duelo de Reflejos ⚡', description: 'Sé el primero en reaccionar.', icon: 'bolt', action: () => setShowReflexDuel(true) },
            { key: 'stop', name: 'Stop the Bus 🚌', description: 'Para el cronómetro en el momento justo.', icon: 'clock-o', action: () => setShowStopTheBus(true) },
            { key: 'gift', name: 'Gift Box 🎁', description: 'Elige una caja y tienta a la suerte.', icon: 'gift', action: () => setShowGiftBox(true) },
        ];

        const selected = minigames[Math.floor(Math.random() * minigames.length)];

        setPendingMinigame({
            key: selected.key,
            name: selected.name,
            description: selected.description,
            icon: selected.icon,
            onPlay: selected.action
        });
    };

    const nextTurn = async () => {
        // Haptic feedback
        playHaptic('light');

        // Mark current card as used if we are using cards
        // In Minigame mode we might not care, but keeping it consistent is fine
        if (!isMinigameOnlyMode) {
            const currentCardId = activeDeck[currentCardIndex]?.id;
            let newUsedIds = [...usedCardIds];
            if (currentCardId && !newUsedIds.includes(currentCardId)) {
                newUsedIds.push(currentCardId);
                setUsedCardIds(newUsedIds);
            }
        }

        // PRE-CALCULATE NEXT CARD INDEX
        let nextCardIndex = currentCardIndex + 1;
        if (nextCardIndex >= activeDeck.length) {
            nextCardIndex = 0;
        }

        // Logic to determine next player (Sequential)
        // We calculate it here but might not apply it if Roulette Mode is active in normal play
        let nextPlayerIndex = currentPlayerIndex + direction;
        if (nextPlayerIndex >= players.length) nextPlayerIndex = 0;
        if (nextPlayerIndex < 0) nextPlayerIndex = players.length - 1;

        if (skipNext) {
            setSkipNext(false);
            nextPlayerIndex = nextPlayerIndex + direction;
            if (nextPlayerIndex >= players.length) nextPlayerIndex = 0;
            if (nextPlayerIndex < 0) nextPlayerIndex = players.length - 1;
        }

        // 1. Minigame Only Mode (Overrides everything else)
        if (isMinigameOnlyMode) {
            // In Minigame mode, we just cycle players appropriately
            // We ignore Card Effects logic
            setCurrentPlayerIndex(nextPlayerIndex);
            triggerRandomMinigame();
            return;
        }

        // Check for special card effect "roulette"
        if (activeDeck[nextCardIndex].specialEffect === 'roulette') {
            setPendingRouletteAction('effect');
            setTimeout(() => setShowRoulette(true), 500); // Auto-open for effect
            return;
        }

        // ARCADE MODE / SPECIAL EFFECT INTERCEPTION
        const effect = activeDeck[nextCardIndex].specialEffect;

        // Check Specific Card Effects
        if (effect === 'minigame_brick') { setTimeout(() => setShowBrickBreaker(true), 500); return; }
        if (effect === 'minigame_flappy') { setTimeout(() => setShowFlappyDrink(true), 500); return; }
        if (effect === 'minigame_roulette') { setTimeout(() => setShowFortuneRoulette(true), 500); return; }
        if (effect === 'minigame_tapper') { setTimeout(() => setShowFastTapper(true), 500); return; }
        if (effect === 'minigame_memory') { setTimeout(() => setShowMemoryChallenge(true), 500); return; }
        if (effect === 'minigame_reflex') { setTimeout(() => setShowReflexDuel(true), 500); return; }
        if (effect === 'minigame_stop') { setTimeout(() => setShowStopTheBus(true), 500); return; }
        if (effect === 'minigame_box') { setTimeout(() => setShowGiftBox(true), 500); return; }

        // Arcade Mode Random Exception
        if (isArcadeMode && !effect) {
            const arcadeRoll = Math.random();
            if (arcadeRoll > 0.94) { setTimeout(() => setShowBrickBreaker(true), 500); return; }
            else if (arcadeRoll > 0.88) { setTimeout(() => setShowFlappyDrink(true), 500); return; }
            else if (arcadeRoll > 0.82) { setTimeout(() => setShowFastTapper(true), 500); return; }
            else if (arcadeRoll > 0.76) { setTimeout(() => setShowReflexDuel(true), 500); return; }
            else if (arcadeRoll > 0.70) { setTimeout(() => setShowMemoryChallenge(true), 500); return; }
        }

        // TURN LOGIC (Normal Mode)
        if (isRouletteMode) {
            setPendingRouletteAction('turn');
            setShowRoulette(true);
        } else {
            // Normal sequential turn
            setCurrentPlayerIndex(nextPlayerIndex);
        }

        // Check if we need to refill/reshuffle deck
        if (currentCardIndex + 1 >= activeDeck.length) {
            // Deck details replacement...
            // For brevity reusing existing simple logic or triggering generic reload
            // But we must maintain the logic
            let nextRound = currentRound;
            if (currentRound === 1) {
                nextRound = 2;
                setCurrentRound(2);
            }
            const candidates = getCardCandidates(nextRound >= 2);
            let available = candidates.filter(c => !usedCardIds.includes(c.id));
            // Note: usedCardIds might not be updated in this scope if we defined newUsedIds? 
            // Actually usedCardIds is state. use 'newUsedIds' logic if needed but we skipped it for Minigame mode.
            // Let's assume standard flow relies on state update which will happen.

            if (available.length === 0) {
                setUsedCardIds([]);
                available = candidates;
            }
            setDeck(shuffleArray(available));
            setCurrentCardIndex(0);
        } else {
            setCurrentCardIndex((prev) => prev + 1);
        }

        // Reset double points after use
        if (doublePoints) {
            setDoublePoints(false);
        }
    };

    const addPoints = (player: string, points: number) => {
        setPlayerScores(prev => {
            const newScores = { ...prev };
            newScores[player] = Math.max(0, (newScores[player] || 0) + points);

            // Check for victory
            if (newScores[player] >= targetScore && !winner) {
                setWinner(player);
                setGameState('victory');
                playHaptic('heavy');
            }

            return newScores;
        });
    };

    const handleSpecialEffect = (effect: string) => {
        switch (effect) {
            case 'double':
                setDoublePoints(true);
                break;
            case 'reverse':
                setDirection(prev => prev === 1 ? -1 : 1);
                break;
            case 'skip':
                setSkipNext(true);
                break;
            case 'steal':
                setSelectionAction('steal');
                setPlayerSelectionModal(true);
                return; // Don't proceed to nextTurn yet
            case 'bonus':
                // Add 5 bonus points
                addPoints(currentPlayer, 5);
                break;
            case 'gift':
                setSelectionAction('gift');
                setPlayerSelectionModal(true);
                return; // Don't proceed to nextTurn yet
            case 'bomb':
                // All players lose 3 points except current player
                setPlayerScores(prev => {
                    const newScores = { ...prev };
                    players.forEach(player => {
                        if (player !== currentPlayer) {
                            newScores[player] = (newScores[player] || 0) - 3;
                        }
                    });
                    return newScores;
                });
                break;
            case 'star':
                // Double points if current player has less than 20
                const currentPoints = playerScores[currentPlayer] || 0;
                if (currentPoints < 20 && currentPoints > 0) {
                    addPoints(currentPlayer, currentPoints); // Add same amount to double
                }
                break;
        }
    };

    const handlePlayerSelection = (selectedPlayer: string) => {
        if (selectionAction === 'steal') {
            // Steal 10 points (can go negative)
            setPlayerScores(prev => {
                const newScores = { ...prev };
                newScores[selectedPlayer] = (newScores[selectedPlayer] || 0) - 10; // Can go negative
                newScores[currentPlayer] = (newScores[currentPlayer] || 0) + 10;
                return newScores;
            });
        } else if (selectionAction === 'gift') {
            // Gift 5 points to selected player
            addPoints(selectedPlayer, 5);
        }
        setPlayerSelectionModal(false);
        setSelectionAction(null);
        nextTurn();
    };

    const handleDrink = (customMessage?: string) => {
        playHaptic('medium');
        setDrinkMessage(customMessage || '¡BEBE!');
        setModalVisible(true);
    };

    const closeDrinkModal = () => {
        setModalVisible(false);
        nextTurn();
    };

    const handleChoice = (choice: 'yes' | 'no') => {
        // Points logic based on card type and answer
        const basePoints = currentCard.points || 1;
        const finalPoints = doublePoints ? basePoints * 2 : basePoints;

        // For "Yo nunca" questions: Yes = you did it (lose points), No = you didn't (gain points)
        if (currentCard.type === 'question') {
            if (choice === 'no') {
                addPoints(currentPlayer, finalPoints); // Didn't do it, gain points
            } else {
                addPoints(currentPlayer, -finalPoints); // Did it, lose points
            }
        } else {
            // For challenges and other types, always gain points
            addPoints(currentPlayer, finalPoints);
        }

        // Handle special effects
        if (currentCard.specialEffect) {
            handleSpecialEffect(currentCard.specialEffect);
            if (currentCard.specialEffect === 'steal') {
                return; // Wait for player selection
            }
        }

        if (currentCard.drinkTrigger === choice) {
            handleDrink(currentCard.drinkAction);
        } else {
            nextTurn();
        }
    };

    const handleContinue = () => {
        // Award points for statement/rule cards
        const basePoints = currentCard.points || 1;
        const finalPoints = doublePoints ? basePoints * 2 : basePoints;
        addPoints(currentPlayer, finalPoints);

        // Handle special effects
        if (currentCard.specialEffect) {
            handleSpecialEffect(currentCard.specialEffect);
            if (currentCard.specialEffect === 'steal') {
                return; // Wait for player selection
            }
        }

        // Handle drink trigger
        if (currentCard.drinkTrigger === 'always') {
            handleDrink(currentCard.drinkAction);
        } else {
            nextTurn();
        }
    };



    const renderConfigAndCustomModals = () => (
        <>
            {/* CONFIG MODAL */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={showConfigModal}
                onRequestClose={() => setShowConfigModal(false)}
            >
                <View style={[styles.container, { paddingTop: 15 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <Text style={[styles.header, { color: colors.darkPink, marginBottom: 0 }]}>Configuración 🎮</Text>
                        <TouchableOpacity onPress={() => setShowConfigModal(false)} style={{ padding: 10 }}>
                            <FontAwesome name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Game Modes Presets */}
                    <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 10 }}>Modos Rápidos:</Text>
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#48dbfb', padding: 10, flex: 1 }]}
                            onPress={() => {
                                setSelectedCategories(['fun', 'general']);
                                setSelectedIntensity('soft');
                            }}
                        >
                            <Text style={[styles.buttonText, { fontSize: 12 }]}>🍦 Chill</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#ff6b6b', padding: 10, flex: 1 }]}
                            onPress={() => {
                                setSelectedCategories(['romantic', 'spicy']);
                                setSelectedIntensity('spicy');
                            }}
                        >
                            <Text style={[styles.buttonText, { fontSize: 12 }]}>🔥 Cita</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#a55eea', padding: 10, flex: 1 }]}
                            onPress={() => {
                                setSelectedCategories(['romantic', 'spicy', 'fun', 'general']);
                                setSelectedIntensity('spicy');
                            }}
                        >
                            <Text style={[styles.buttonText, { fontSize: 12 }]}>😈 Caos</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                        <Text style={[styles.subheader, { color: colors.text, marginBottom: 20, marginTop: 10 }]}>Personaliza tu experiencia</Text>

                        {/* Roulette Mode Toggle */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: 'rgba(0,0,0,0.05)', padding: 10, borderRadius: 10 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.text, fontWeight: 'bold' }}>🎲 Modo Ruleta (Caos)</Text>
                                <Text style={{ color: colors.text, fontSize: 12, opacity: 0.7 }}>Turnos aleatorios en cada carta</Text>
                            </View>
                            <Switch
                                trackColor={{ false: "#767577", true: colors.purple }}
                                thumbColor={isRouletteMode ? "#f4f3f4" : "#f4f3f4"}
                                onValueChange={() => setIsRouletteMode(prev => !prev)}
                                value={isRouletteMode}
                            />
                        </View>

                        {/* Arcade Mode Toggle */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: 'rgba(0,0,0,0.05)', padding: 10, borderRadius: 10 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.text, fontWeight: 'bold' }}>🕹️ Modo Arcade (Minijuegos)</Text>
                                <Text style={{ color: colors.text, fontSize: 12, opacity: 0.7 }}>Aparición frecuente de minijuegos</Text>
                            </View>
                            <Switch
                                trackColor={{ false: "#767577", true: colors.orange }}
                                thumbColor={isArcadeMode ? "#f4f3f4" : "#f4f3f4"}
                                onValueChange={(v) => {
                                    setIsArcadeMode(v);
                                    if (v) setIsMinigameOnlyMode(false);
                                }}
                                value={isArcadeMode}
                            />
                        </View>

                        {/* Minigames Only Toggle */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: 'rgba(0,0,0,0.05)', padding: 10, borderRadius: 10 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.text, fontWeight: 'bold' }}>🎮 Solo Minijuegos</Text>
                                <Text style={{ color: colors.text, fontSize: 12, opacity: 0.7 }}>Sin cartas, solo acción desenfrenada</Text>
                            </View>
                            <Switch
                                trackColor={{ false: "#767577", true: colors.purple }}
                                thumbColor={isMinigameOnlyMode ? "#f4f3f4" : "#f4f3f4"}
                                onValueChange={(v) => {
                                    setIsMinigameOnlyMode(v);
                                    if (v) setIsArcadeMode(false);
                                }}
                                value={isMinigameOnlyMode}
                            />
                        </View>

                        {/* Categories Selection */}
                        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                            🏷️ Categorías
                        </Text>
                        <Text style={{ color: colors.text, opacity: 0.7, fontSize: 13, marginBottom: 10 }}>
                            Selecciona las categorías que quieres incluir
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 }}>
                            {[
                                { key: 'romantic', label: 'Romántica', icon: '💕', color: colors.pink },
                                { key: 'spicy', label: 'Picante', icon: '🌶️', color: colors.orange },
                                { key: 'fun', label: 'Divertida', icon: '🎉', color: colors.lightOrange },
                                { key: 'general', label: 'General', icon: '⭐', color: colors.purple },
                            ].map(cat => (
                                <TouchableOpacity
                                    key={cat.key}
                                    style={{
                                        flex: 1,
                                        minWidth: '45%',
                                        backgroundColor: selectedCategories.includes(cat.key) ? cat.color : colors.inputBackground,
                                        paddingVertical: 15,
                                        paddingHorizontal: 10,
                                        borderRadius: 12,
                                        borderWidth: 2,
                                        borderColor: selectedCategories.includes(cat.key) ? cat.color : 'transparent',
                                        alignItems: 'center',
                                    }}
                                    onPress={() => {
                                        if (selectedCategories.includes(cat.key)) {
                                            setSelectedCategories(selectedCategories.filter(c => c !== cat.key));
                                        } else {
                                            setSelectedCategories([...selectedCategories, cat.key]);
                                        }
                                    }}
                                >
                                    <Text style={{ fontSize: 28, marginBottom: 5 }}>{cat.icon}</Text>
                                    <Text style={{ color: selectedCategories.includes(cat.key) ? 'white' : colors.text, fontSize: 13, fontWeight: '600' }}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Intensity Selection */}
                        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                            🔥 Intensidad
                        </Text>
                        <Text style={{ color: colors.text, opacity: 0.7, fontSize: 13, marginBottom: 10 }}>
                            ¿Qué tan atrevidas quieres las cartas?
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 25 }}>
                            {[
                                { key: 'soft', label: 'Suave', icon: '😊', desc: 'Para empezar' },
                                { key: 'medium', label: 'Medio', icon: '😏', desc: 'Equilibrado' },
                                { key: 'spicy', label: 'Picante', icon: '🔥', desc: 'Sin límites' },
                            ].map(level => (
                                <TouchableOpacity
                                    key={level.key}
                                    style={{
                                        flex: 1,
                                        backgroundColor: selectedIntensity === level.key ? colors.darkPink : colors.inputBackground,
                                        paddingVertical: 15,
                                        borderRadius: 12,
                                        borderWidth: 2,
                                        borderColor: selectedIntensity === level.key ? colors.darkPink : 'transparent',
                                        alignItems: 'center',
                                    }}
                                    onPress={() => setSelectedIntensity(level.key as any)}
                                >
                                    <Text style={{ fontSize: 28, marginBottom: 5 }}>{level.icon}</Text>
                                    <Text style={{ color: selectedIntensity === level.key ? 'white' : colors.text, fontSize: 13, fontWeight: '600' }}>
                                        {level.label}
                                    </Text>
                                    <Text style={{ color: selectedIntensity === level.key ? 'white' : colors.text, fontSize: 10, opacity: 0.7, marginTop: 2 }}>
                                        {level.desc}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Custom Cards Button */}
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.purple, marginBottom: 15 }]}
                            onPress={() => setShowCustomCardModal(true)}
                        >
                            <Text style={styles.buttonText}>➕ Añadir Cartas Personalizadas ({customCards.length})</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Button Removed */}
                </View>
            </Modal>

            {/* Custom Card Modal - Always available, displays on top */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showCustomCardModal}
                onRequestClose={() => setShowCustomCardModal(false)}
            >
                <View style={styles.modalView}>
                    <View style={[styles.modalContent, { backgroundColor: colors.modalBackground, width: '90%', maxHeight: '90%', padding: 20 }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.purple, marginBottom: 15 }]}>
                            <FontAwesome name="plus-circle" size={28} color={colors.purple} />
                            <Text style={[styles.modalTitle, { color: colors.text, fontSize: 20 }]}>Crear Carta</Text>
                        </View>

                        <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={true}>
                            <View style={{ paddingHorizontal: 5 }}>
                                <Text style={{ color: colors.text, marginTop: 16, marginBottom: 8, fontWeight: '700', fontSize: 14 }}>🎯 Tipo de Carta:</Text>
                                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 5 }}>
                                    {[
                                        { key: 'question', label: 'Pregunta', icon: '❓', mode: 'binary', hint: 'Sí/No (Yo Nunca)' },
                                        { key: 'challenge', label: 'Reto', icon: '⚡', mode: 'statement', hint: 'Acción directa' },
                                        { key: 'rule', label: 'Regla', icon: '📜', mode: 'rule', hint: 'Nueva norma' },
                                    ].map(type => (
                                        <TouchableOpacity
                                            key={type.key}
                                            style={{
                                                flex: 1,
                                                backgroundColor: newCustomCard.type === type.key ? colors.pink : colors.inputBackground,
                                                paddingVertical: 12,
                                                borderRadius: 12,
                                                borderWidth: 2,
                                                borderColor: newCustomCard.type === type.key ? colors.darkPink : 'transparent',
                                                alignItems: 'center',
                                            }}
                                            onPress={() => setNewCustomCard({
                                                ...newCustomCard,
                                                type: type.key as any,
                                                mode: type.mode as any // Auto-set mode
                                            })}
                                        >
                                            <Text style={{ fontSize: 24, marginBottom: 4 }}>{type.icon}</Text>
                                            <Text style={{ color: newCustomCard.type === type.key ? 'white' : colors.text, fontSize: 13, fontWeight: 'bold' }}>
                                                {type.label}
                                            </Text>
                                            <Text style={{ color: newCustomCard.type === type.key ? 'rgba(255,255,255,0.8)' : colors.text, fontSize: 10, opacity: newCustomCard.type === type.key ? 1 : 0.6 }}>
                                                {type.hint}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={{ color: colors.text, marginTop: 16, marginBottom: 8, fontWeight: '700', fontSize: 14 }}>📝 Texto de la carta:</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, height: 100, textAlignVertical: 'top', padding: 15, fontSize: 16, borderRadius: 12 }]}
                                    placeholder={
                                        newCustomCard.type === 'question' ? "Ej: ¿Alguna vez te has liado con la ex de una amiga?" :
                                            newCustomCard.type === 'challenge' ? "Ej: La persona más joven bebe 2 tragos." :
                                                "Ej: Prohibido decir la palabra 'NO' hasta el siguiente turno."
                                    }
                                    placeholderTextColor={colors.text + '60'}
                                    value={newCustomCard.text}
                                    onChangeText={(text) => setNewCustomCard({ ...newCustomCard, text })}
                                    multiline
                                />

                                <Text style={{ color: colors.text, marginTop: 16, marginBottom: 8, fontWeight: '700', fontSize: 14 }}>🏷️ Categoría:</Text>
                                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                                    {[
                                        { key: 'romantic', label: 'Romántica', icon: '💕', color: colors.pink },
                                        { key: 'spicy', label: 'Picante', icon: '🌶️', color: colors.orange },
                                        { key: 'fun', label: 'Divertida', icon: '🎉', color: colors.lightOrange },
                                        { key: 'general', label: 'General', icon: '⭐', color: colors.purple },
                                    ].map(cat => (
                                        <TouchableOpacity
                                            key={cat.key}
                                            style={{
                                                flex: 1,
                                                minWidth: '45%',
                                                backgroundColor: newCustomCard.category === cat.key ? cat.color : colors.inputBackground,
                                                paddingVertical: 10,
                                                borderRadius: 10,
                                                borderWidth: 2,
                                                borderColor: newCustomCard.category === cat.key ? cat.color : 'transparent',
                                                alignItems: 'center',
                                            }}
                                            onPress={() => setNewCustomCard({ ...newCustomCard, category: cat.key as any })}
                                        >
                                            <Text style={{ fontSize: 20, marginBottom: 2 }}>{cat.icon}</Text>
                                            <Text style={{ color: newCustomCard.category === cat.key ? 'white' : colors.text, fontSize: 10, fontWeight: '600' }}>
                                                {cat.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={{ color: colors.text, marginTop: 16, marginBottom: 8, fontWeight: '700', fontSize: 14 }}>🔥 Intensidad:</Text>
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                    {[
                                        { key: 'soft', label: 'Suave', icon: '😊' },
                                        { key: 'medium', label: 'Medio', icon: '😏' },
                                        { key: 'spicy', label: 'Picante', icon: '🔥' },
                                    ].map(level => (
                                        <TouchableOpacity
                                            key={level.key}
                                            style={{
                                                flex: 1,
                                                backgroundColor: newCustomCard.intensity === level.key ? colors.darkPink : colors.inputBackground,
                                                paddingVertical: 10,
                                                borderRadius: 10,
                                                borderWidth: 2,
                                                borderColor: newCustomCard.intensity === level.key ? colors.darkPink : 'transparent',
                                                alignItems: 'center',
                                            }}
                                            onPress={() => setNewCustomCard({ ...newCustomCard, intensity: level.key as any })}
                                        >
                                            <Text style={{ fontSize: 20, marginBottom: 2 }}>{level.icon}</Text>
                                            <Text style={{ color: newCustomCard.intensity === level.key ? 'white' : colors.text, fontSize: 10, fontWeight: '600' }}>
                                                {level.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {customCards.length > 0 && (
                                    <View style={{ marginTop: 20, flex: 1 }}>
                                        <Text style={{ color: colors.text, marginBottom: 10, fontWeight: '700', fontSize: 14 }}>
                                            📚 Tus cartas ({customCards.length}):
                                        </Text>
                                        <View style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)', borderRadius: 12, padding: 5, maxHeight: 200 }}>
                                            <ScrollView nestedScrollEnabled={true} style={{ width: '100%' }}>
                                                {customCards.map((card, index) => (
                                                    <View key={card.id} style={{
                                                        backgroundColor: colors.cardBackground,
                                                        marginBottom: 8,
                                                        padding: 12,
                                                        borderRadius: 10,
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        borderLeftWidth: 4,
                                                        borderLeftColor:
                                                            card.category === 'romantic' ? colors.pink :
                                                                card.category === 'spicy' ? colors.orange :
                                                                    card.category === 'fun' ? colors.lightOrange :
                                                                        colors.purple,
                                                        elevation: 2,
                                                        shadowColor: "#000",
                                                        shadowOffset: { width: 0, height: 1 },
                                                        shadowOpacity: 0.2,
                                                        shadowRadius: 1.41,
                                                    }}>
                                                        <Text style={{ marginRight: 10, fontSize: 16 }}>
                                                            {card.type === 'question' ? '❓' : card.type === 'challenge' ? '⚡' : '📜'}
                                                        </Text>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }} numberOfLines={2}>
                                                                {card.text}
                                                            </Text>
                                                            <Text style={{ color: colors.text, fontSize: 10, opacity: 0.6, marginTop: 2 }}>
                                                                {(card.category || 'general').toUpperCase()} • {(card.intensity || 'medium').toUpperCase()}
                                                            </Text>
                                                        </View>
                                                        <View style={{ flexDirection: 'row' }}>
                                                            <TouchableOpacity onPress={() => editCustomCard(card)} style={{ padding: 8 }}>
                                                                <FontAwesome name="pencil" size={18} color={colors.purple} />
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={() => deleteCustomCard(card.id)} style={{ padding: 8 }}>
                                                                <FontAwesome name="trash" size={18} color={colors.orange} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </ScrollView>

                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 15, width: '100%' }}>
                            {newCustomCard.id ? (
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: colors.inputBackground, flex: 1 }]}
                                    onPress={cancelEdit}
                                >
                                    <Text style={[styles.buttonText, { color: colors.text }]}>Cancelar Edición</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: colors.inputBackground, flex: 1 }]}
                                    onPress={() => setShowCustomCardModal(false)}
                                >
                                    <Text style={[styles.buttonText, { color: colors.text }]}>Cerrar</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.pink, flex: 1, opacity: newCustomCard.text.trim() ? 1 : 0.5 }]}
                                onPress={addCustomCard}
                                disabled={!newCustomCard.text.trim()}
                            >
                                <Text style={styles.buttonText}>{newCustomCard.id ? 'Guardar Cambios' : 'Añadir'} ✓</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );

    // --- RENDER ---
    if (gameState === 'setup') {
        return (
            <View style={styles.container}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20 }}>
                    <Text style={[styles.header, { color: colors.darkPink }]}>LesGo 🌈</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity onPress={() => setShowConfigModal(true)} style={{ padding: 10 }}>
                            <FontAwesome name="cog" size={28} color={colors.purple} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowInfoModal(true)} style={styles.infoButtonTop}>
                            <FontAwesome name="info-circle" size={28} color={colors.darkPink} />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={[styles.subheader, { color: colors.text }]}>Añadir Jugadoras</Text>

                {/* Inline Game Modes removed - Moved to Config Modal */}

                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                        placeholder="Nombre"
                        placeholderTextColor={isDark ? '#aaa' : '#666'}
                        value={newPlayerName}
                        onChangeText={setNewPlayerName}
                        onSubmitEditing={addPlayer}
                    />
                    <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.pink }]} onPress={addPlayer}>
                        <FontAwesome name="plus" size={20} color="white" />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.playerList} contentContainerStyle={{ gap: 10 }}>
                    {players.map((player, index) => (
                        <View key={index} style={[styles.playerItem, { backgroundColor: colors.cardBackground }]}>
                            <Text style={[styles.playerText, { color: colors.text }]}>{player}</Text>
                            <TouchableOpacity onPress={() => removePlayer(index)}>
                                <FontAwesome name="trash" size={20} color={colors.orange} />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {players.length === 0 && (
                        <Text style={{ textAlign: 'center', opacity: 0.5, marginTop: 20 }}>Añade jugadoras para empezar</Text>
                    )}
                </ScrollView>
                <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: players.length > 0 ? colors.orange : '#ccc' }]}
                    onPress={startGame}
                    disabled={players.length === 0}
                >
                    <Text style={styles.startButtonText}>EMPEZAR JUEGO</Text>
                </TouchableOpacity>

                {/* Info Modal - Only in Setup Screen */}
                <InfoModal
                    visible={showInfoModal}
                    onClose={() => setShowInfoModal(false)}
                    colors={colors}
                    targetScore={targetScore}
                />
                {renderConfigAndCustomModals()}
            </View >
        );
    }

    if (gameState === 'victory') {
        return (
            <>
                <VictoryScreen
                    winner={winner || ''}
                    scores={playerScores}
                    onContinue={continueGame}
                    onReset={resetGame}
                    colors={colors}
                    targetScore={targetScore}
                />
                {renderConfigAndCustomModals()}
            </>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerButtons}>
                <TouchableOpacity style={styles.scoreButton} onPress={() => setShowScoreboard(true)}>
                    <FontAwesome name="trophy" size={24} color={colors.gold} />
                    <Text style={[styles.scoreText, { color: colors.text }]}>{playerScores[currentPlayer] || 0} pts</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleExitClick} style={[styles.scoreButton, { marginLeft: 10, backgroundColor: 'rgba(255,0,0,0.2)' }]}>
                    <FontAwesome name="times" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Special Effects Indicators */}
            {
                (doublePoints || skipNext || direction === -1) && (
                    <View style={styles.effectsBar}>
                        {doublePoints && <Text style={styles.effectBadge}>🔥 DOBLE PUNTOS</Text>}
                        {skipNext && <Text style={styles.effectBadge}>⏭️ PRÓXIMO TURNO SALTADO</Text>}
                        {direction === -1 && <Text style={styles.effectBadge}>🔄 SENTIDO INVERTIDO</Text>}
                    </View>
                )
            }

            {/* Current Player Score */}
            <View style={styles.currentScoreBar}>
                <View style={styles.currentScoreInfo}>
                    <Text style={[styles.currentScoreLabel, { color: colors.text }]}>Tu puntuación:</Text>
                    <Text style={[styles.currentScoreValue, { color: colors.darkPink }]}>
                        {playerScores[currentPlayer] || 0} pts
                    </Text>
                </View>
                <TouchableOpacity onPress={() => setShowScoreboard(true)} style={styles.viewAllButton}>
                    <FontAwesome name="list" size={16} color={colors.white} />
                    <Text style={{ color: colors.white, marginLeft: 5, fontSize: 12 }}>Ver todas</Text>
                </TouchableOpacity>
            </View>

            {pendingMinigame ? (
                // Minigame Intro Card
                <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{
                        width: '90%',
                        aspectRatio: 0.7, // Card shape
                        backgroundColor: colors.cardBackground,
                        borderRadius: 20,
                        padding: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        elevation: 5,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                    }}>
                        <FontAwesome name={pendingMinigame.icon as any} size={80} color={colors.purple} style={{ marginBottom: 30 }} />
                        <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 15, textAlign: 'center' }}>
                            {pendingMinigame.name}
                        </Text>
                        <Text style={{ fontSize: 18, color: colors.text, textAlign: 'center', opacity: 0.8, marginBottom: 30, lineHeight: 24 }}>
                            {pendingMinigame.description}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)', padding: 10, borderRadius: 15 }}>
                            <Text style={{ fontSize: 16, color: colors.text, marginRight: 5 }}>Turno de:</Text>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.darkPink }}>{players[currentPlayerIndex]}</Text>
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.purple, width: '100%' }]}
                            onPress={pendingMinigame.onPlay}
                        >
                            <Text style={styles.buttonText}>🎮 JUGAR</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <>
                    <GameCard
                        card={currentCard}
                        formattedText={formatCardText(currentCard.text, players, players[currentPlayerIndex])}
                        isCustom={customCards.some(c => c.id === currentCard.id)}
                        colors={colors}
                        onTimerStart={() => startTimer(10)}
                    />

                    <View style={styles.buttonContainer}>
                        {currentCard.mode === 'binary' ? (
                            <>
                                {/* NO Logic */}
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: colors.orange }]}
                                    onPress={() => handleChoice('no')}
                                >
                                    <Text style={styles.buttonText}>NO</Text>
                                </TouchableOpacity>

                                {/* YES Logic */}
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: colors.pink }]}
                                    onPress={() => handleChoice('yes')}
                                >
                                    <Text style={styles.buttonText}>SÍ / HECHO</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                {/* Statement / Rule Handling */}
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: isRouletteMode ? colors.purple : colors.pink }]}
                                    onPress={nextTurn}
                                >
                                    <Text style={styles.buttonText}>
                                        {isRouletteMode ? '🎲 GIRAR (SIGUIENTE)' : currentCard.mode === 'rule' ? 'ACEPTO' : 'SIGUIENTE'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </>
            )}



            {/* Drink Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeDrinkModal}
            >
                <View style={styles.modalView}>
                    <View style={styles.modalContent}>
                        <Text style={styles.drinkText}>{drinkMessage}</Text>
                        <Text style={styles.victimText}>{currentPlayer}</Text>
                        <FontAwesome name="glass" size={80} color={colors.darkPink} />
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: colors.orange }]}
                            onPress={closeDrinkModal}
                        >
                            <Text style={styles.buttonText}>¡He bebido!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* All Scores Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showScoreboard}
                onRequestClose={() => setShowScoreboard(false)}
            >
                <View style={styles.modalView}>
                    <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.pink }]}>
                            <FontAwesome name="trophy" size={30} color={colors.pink} />
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Puntuaciones</Text>
                        </View>
                        <ScrollView style={{ width: '100%', maxHeight: 500, marginTop: 10 }}>
                            {/* Scoreboard Section */}
                            {players
                                .map((player, index) => ({ player, score: playerScores[player] || 0, index }))
                                .sort((a, b) => b.score - a.score)
                                .map(({ player, score, index }, position) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.scoreRowModal,
                                            {
                                                backgroundColor: player === currentPlayer
                                                    ? colors.accentGradient
                                                    : 'transparent'
                                            }
                                        ]}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <Text style={{ fontSize: 20, width: 30 }}>
                                                {position === 0 ? '🥇' : position === 1 ? '🥈' : position === 2 ? '🥉' : '  '}
                                            </Text>
                                            <Text style={[styles.scorePlayerName, { color: colors.text, fontSize: 18 }]}>
                                                {player === currentPlayer ? '▶ ' : ''}{player}
                                            </Text>
                                        </View>
                                        <Text style={[styles.scorePoints, { color: colors.pink, fontSize: 20, fontWeight: 'bold' }]}>
                                            {score} pts
                                        </Text>
                                    </View>
                                ))}

                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.pink, marginTop: 30, marginBottom: 20 }]}
                                onPress={() => setShowScoreboard(false)}
                            >
                                <Text style={styles.buttonText}>Cerrar</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Config Modal Removed */}

            {/* Exit Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showExitConfirm}
                onRequestClose={() => setShowExitConfirm(false)}
            >
                <View style={styles.modalView}>
                    <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
                        <FontAwesome name="exclamation-triangle" size={60} color={colors.orange} style={{ marginBottom: 20 }} />
                        <Text style={[styles.modalTitle, { color: colors.text }]}>¿Estás segura?</Text>
                        <Text style={{ fontSize: 16, color: colors.text, textAlign: 'center', marginTop: 10, marginBottom: 30, opacity: 0.8 }}>
                            Vas a perder la partida y todos los puntos
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 15, width: '100%' }}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.pink, flex: 1 }]}
                                onPress={() => setShowExitConfirm(false)}
                            >
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.orange, flex: 1 }]}
                                onPress={resetGame}
                            >
                                <Text style={styles.buttonText}>Salir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Player Selection Modal (for steal/gift) */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={playerSelectionModal}
                onRequestClose={() => setPlayerSelectionModal(false)}
            >
                <View style={styles.modalView}>
                    <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.orange }]}>
                            <FontAwesome name={selectionAction === 'gift' ? "gift" : "hand-paper-o"} size={30} color={colors.orange} />
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {selectionAction === 'gift' ? 'Regala 5 puntos' : 'Elige una jugadora'}
                            </Text>
                        </View>
                        <ScrollView style={{ width: '100%', maxHeight: 300, marginTop: 10 }}>
                            {players.filter(p => p !== currentPlayer).map((player, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.playerSelectButton, { backgroundColor: colors.pink }]}
                                    onPress={() => handlePlayerSelection(player)}
                                >
                                    <Text style={styles.buttonText}>{player}</Text>
                                    <Text style={{ color: 'white', fontSize: 14, opacity: 0.9 }}>
                                        {playerScores[player] || 0} pts
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {renderConfigAndCustomModals()}

            {/* Timer Modal */}
            <TimerModal
                visible={timerVisible}
                timeLeft={timeLeft}
                onClose={() => { setTimerVisible(false); setTimerActive(false); }}
                onStartTimer={startTimer}
                colors={colors}
            />

            {/* Roulette Modal */}
            <RouletteModal
                visible={showRoulette}
                players={players}
                onClose={() => setShowRoulette(false)}
                onWinner={handleRouletteWinner}
                colors={colors}
            />

            <BrickBreaker
                visible={showBrickBreaker}
                onClose={(success) => {
                    setShowBrickBreaker(false);
                    if (success) playHaptic('heavy');
                    else handleDrink('¡HAS PERDIDO!');
                    nextTurn();
                }}
                colors={colors}
            />

            <FlappyDrink
                visible={showFlappyDrink}
                onClose={(success) => {
                    setShowFlappyDrink(false);
                    if (!success) handleDrink('¡HAS CHOCADO!');
                    nextTurn();
                }}
                colors={colors}
            />

            <FortuneRoulette
                visible={showFortuneRoulette}
                onClose={handleFortuneResult}
                colors={colors}
            />

            <FastTapper
                visible={showFastTapper}
                onClose={(success) => {
                    setShowFastTapper(false);
                    if (!success) handleDrink('¡PULSACIONES CARDÍACAS BAJAS!');
                    nextTurn();
                }}
                colors={colors}
            />

            <MemoryChallenge
                visible={showMemoryChallenge}
                onClose={(success) => {
                    setShowMemoryChallenge(false);
                    if (!success) handleDrink('¡MEMORIA DE PEZ!');
                    nextTurn();
                }}
                colors={colors}
            />

            <ReflexDuel
                visible={showReflexDuel}
                onClose={(success) => {
                    setShowReflexDuel(false);
                    if (!success) handleDrink('¡BANG! ESTÁS MUERTO.');
                    nextTurn();
                }}
                colors={colors}
            />

            <StopTheBus
                visible={showStopTheBus}
                onClose={(success) => {
                    setShowStopTheBus(false);
                    if (!success) handleDrink('¡TE HAS PASADO!');
                    nextTurn();
                }}
                colors={colors}
            />

            <GiftBox
                visible={showGiftBox}
                onClose={(success) => {
                    setShowGiftBox(false);
                    if (!success) handleDrink('¡BOMBAZO!');
                    nextTurn();
                }}
                colors={colors}
            />


        </View >
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        paddingTop: 45,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    subheader: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        opacity: 0.8,
    },
    // Setup Styles
    inputContainer: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 20,
        gap: 10,
    },
    input: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
    },
    addButton: {
        padding: 15,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
    },
    playerList: {
        width: '100%',
        flex: 1,
        marginBottom: 20,
    },
    playerItem: {
        padding: 20,
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
    },
    playerText: {
        fontSize: 18,
        fontWeight: '600',
    },
    startButton: {
        width: '100%',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 5,
        marginBottom: 20,
    },
    startButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    // Game UI
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: 20,
    },
    turnInfo: {
        alignItems: 'center',
    },
    exitButtonTop: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
    },
    turnLabel: {
        fontSize: 16,
        opacity: 0.6,
    },
    turnPlayer: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    card: {
        width: '100%',
        flex: 1,
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 30,
    },
    iconContainer: {
        marginBottom: 20,
    },
    cardText: {
        fontSize: 24,
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 20,
    },
    cardType: {
        fontSize: 14,
        fontWeight: 'bold',
        opacity: 0.8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 20,
        marginBottom: 20,
    },
    button: {
        flex: 1,
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resetButton: {
        padding: 10,
    },
    // Modal Styles
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 50,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    drinkText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#D52D00', // Deep Orange
        marginBottom: 10,
        textAlign: 'center',
    },
    victimText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    modalButton: {
        marginTop: 40,
        padding: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    safeArea: {
        flex: 1,
    },
    headerButtons: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    // Points System Styles
    scoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        gap: 8
    },
    scoreText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    effectsBar: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 15,
        width: '100%',
    },
    effectBadge: {
        backgroundColor: '#FF9A56',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
    },
    scoreboard: {
        width: '100%',
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
        maxHeight: 200,
    },
    scoreboardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    scorePlayerName: {
        fontSize: 16,
        fontWeight: '600',
    },
    scorePoints: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    playerSelectButton: {
        padding: 15,
        borderRadius: 10,
        marginVertical: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    winnerText: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    winnerSubtext: {
        fontSize: 20,
        marginBottom: 20,
    },
    finalScoreboard: {
        width: '100%',
        padding: 20,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    currentScoreBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: 15,
        backgroundColor: 'rgba(211, 98, 164, 0.1)',
        borderRadius: 15,
        marginBottom: 15,
    },
    currentScoreInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    currentScoreLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    currentScoreValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E91E8C',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        paddingBottom: 15,
        borderBottomWidth: 2,
        width: '100%',
    },
    modalTitle: {
        fontSize: 26,
        fontWeight: 'bold',
    },
    scoreRowModal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginVertical: 4,
    },
    infoButtonTop: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
    },
    infoText: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 10,
    },
    infoSection: {
        fontSize: 17,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    configRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        width: '100%',
    },
    configLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
