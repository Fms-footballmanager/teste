/**
 * MathHelpers.js
 * 
 * Funções auxiliares matemáticas
 */

const MathHelpers = {
    /**
     * Calcula distância entre dois pontos
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    /**
     * Calcula ângulo entre dois pontos
     */
    angleBetween(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },
    
    /**
     * Gera número aleatório com distribuição gaussiana
     */
    randomGaussian(mean = 0, stdDev = 1) {
        let u1 = Math.random();
        let u2 = Math.random();
        let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return z0 * stdDev + mean;
    },
    
    /**
     * Clamp - limita valor entre min e max
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    /**
     * Interpolação linear
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },
    
    /**
     * Normaliza ângulo entre -PI e PI
     */
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }
};
