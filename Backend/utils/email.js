
const { userCollection, vehicleCollection } = require('../../mongoConnection');
// instance de NodeCache
const nodemailer = require('nodemailer');

async function checkUserImmatriculationExpiration(ownerId) {
    try {
        // Récupérer tous les véhicules de l'utilisateur spécifié
        const userCars = await vehicleCollection.find({ owner: ownerId }).toArray();

        // Parcourir tous les véhicules de l'utilisateur pour vérifier la date d'expiration de l'immatriculation
        userCars.forEach(async (car) => {
            const immatriculationDate = new Date(car.immatriculation.date);
            const currentDate = new Date();

            // Vérifier si la date d'expiration est dépassée
            if (currentDate > immatriculationDate) {
                // Envoyer un email à l'utilisateur pour informer de l'expiration de l'immatriculation du véhicule
                await sendExpirationEmailV1(ownerId, car._id);
            }
        });
    } catch (error) {
        console.error("Erreur lors de la vérification de l'expiration de l'immatriculation :", error);
        throw new Error("Erreur lors de la vérification de l'expiration de l'immatriculation");
    }
}

async function sendEmail(email, subject, message) {
  try {
   
      // Créer un transporteur SMTP
      let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: 'impact@email.com', //A definir avec l'equipe
              pass: 'impactPassword'
          }
      });

      // Options de l'email
      let mailOptions = {
          from: 'impact@email.com',
          to: email,
          subject: subject,
          text: message
      };

      // Envoi de l'email
      await transporter.sendMail(mailOptions);
      

      // Pour cet exemple, je vais simplement afficher les informations de l'email dans la console
      console.log("Email envoyé avec succès :");
      console.log("À :", email);
      console.log("Objet :", subject);
      console.log("Message :", message);
  } catch (error) {
      console.error("Erreur lors de l'envoi de l'email :", error);
      throw new Error("Erreur lors de l'envoi de l'email");
  }
}

async function sendExpirationEmailV1(ownerId, carId) {
  try {
      // Récupérer l'adresse email de l'utilisateur à partir de son ID
      const user = await userCollection.findOne({ _id: ownerId });
      if (!user || !user.email) {
          throw new Error("Adresse email de l'utilisateur non trouvée");
      }

      // Récupérer les détails du véhicule à partir de son ID
      const car = await vehicleCollection.findOne({ _id: carId });
      if (!car || !car.plate) {
          throw new Error("Détails du véhicule non trouvés");
      }

      // Construction du message d'email
      const subject = "Expiration d'immatriculation";
      const message = `Bonjour,\n\nVotre immatriculation pour le véhicule avec la plaque d'immatriculation ${car.plate} est arrivée à expiration. Veuillez procéder au renouvellement dès que possible.\n\nCordialement,\nVotre équipe de gestion des véhicules`;

      // Envoi de l'email à l'utilisateur
      await sendEmail(user.email, subject, message);

      console.log(`Email d'expiration envoyé à l'utilisateur ${user.email} pour le véhicule ${car.plate}`);
  } catch (error) {
      console.error("Erreur lors de l'envoi de l'email d'expiration :", error);
      throw new Error("Erreur lors de l'envoi de l'email d'expiration");
  }
}

module.exports = {
    checkUserImmatriculationExpiration,
    sendEmail,
    sendExpirationEmailV1,
};
