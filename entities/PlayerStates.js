/**
 * PlayerStates.js
 * 
 * Definições de estados possíveis para os jogadores
 */

const PlayerStates = {
    IDLE: 'IDLE',
    RUNNING: 'RUNNING',
    SHOOTING: 'SHOOTING',
    DEFENDING: 'DEFENDING',
    DRIBBLING: 'DRIBBLING',
    INTERCEPTING: 'INTERCEPTING',
    RETURNING: 'RETURNING'
};

// Transições de estado permitidas
const StateTransitions = {
    IDLE: ['RUNNING', 'SHOOTING', 'DEFENDING', 'INTERCEPTING'],
    RUNNING: ['IDLE', 'SHOOTING', 'DRIBBLING', 'DEFENDING', 'INTERCEPTING'],
    SHOOTING: ['IDLE', 'RUNNING'],
    DEFENDING: ['IDLE', 'RUNNING', 'INTERCEPTING'],
    DRIBBLING: ['RUNNING', 'SHOOTING', 'IDLE'],
    INTERCEPTING: ['RUNNING', 'DEFENDING', 'IDLE'],
    RETURNING: ['IDLE', 'RUNNING', 'DEFENDING']
};

/**
 * Verifica se uma transição de estado é válida
 */
function canTransitionTo(currentState, newState) {
    return StateTransitions[currentState] && 
           StateTransitions[currentState].includes(newState);
}

/**
 * Retorna descrição legível do estado
 */
function getStateDescription(state) {
    const descriptions = {
        IDLE: 'Parado',
        RUNNING: 'Correndo',
        SHOOTING: 'Chutando',
        DEFENDING: 'Defendendo',
        DRIBBLING: 'Driblando',
        INTERCEPTING: 'Interceptando',
        RETURNING: 'Retornando à posição'
    };
    return descriptions[state] || state;
}
