// #DATABASE AND COLLECTIONS
//MAIN DB
const MAINDB = 'impact_db';
// COLLECTIONS
const USERSCOLLECTION = 'users';
const TKNRVKCOLLECTION = 'tknRvk';
//PSSWRDS
//JWT
const JWTSTKEY = 'uisebd7OOA4pvfrSAT61JDPger35g1dHSfxb51f5g';

// TIME AUTO TASKS
// la programmation des temps d'exécution automatiques de Cron
const CRONTIMER = {
    EVERYMINUTE: '* * * * *', //  à chaque minute
    WEEKLYSUNDNIGHT: '0 0 * * 0', // chaque semaine, le dimanche à minuit.
    EVERYSIXHOURS: '0 */6 * * *',
    EVERY24HOURS: '0 0 * * *',
    EVERYHOUR: '0 * * * *', //  toutes les heures
    DAILY3AM: '0 3 * * *', //  tous les jours à 3 heures du matin.
};

module.exports = {

    MAINDB,
    USERSCOLLECTION,
    JWTSTKEY,
    TKNRVKCOLLECTION,
    CRONTIMER
};