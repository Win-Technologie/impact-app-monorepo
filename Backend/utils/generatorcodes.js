/* Toutes les fonctions qui génèrent des codes de sécurité 
    aléatoires sont ajoutées ici.  */

    function generateVerificationCode() {
        // Générer un code aléatoire à 6 chiffres
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    
    module.exports = {
        generateVerificationCode,
    
    };
    