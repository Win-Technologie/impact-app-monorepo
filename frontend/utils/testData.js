// Random test data generator for signup forms (DEV ONLY)
const firstNames = ["Jean", "Marie", "Pierre", "Sophie", "Luc", "Emma", "Alex", "Clara", "Marc", "Julie"];
const lastNames = ["Tremblay", "Gagnon", "Roy", "Côté", "Bouchard", "Gauthier", "Morin", "Lavoie", "Fortin", "Pelletier"];
const cities = ["Montréal", "Québec", "Laval", "Gatineau", "Longueuil", "Sherbrooke", "Lévis", "Saguenay"];
const streets = ["Rue Principale", "Boul Saint-Laurent", "Avenue du Parc", "Rue Sainte-Catherine", "Rue King", "Rue Wellington"];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randDigits = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
const randPostal = () => {
  const letters = "ABCEGHJKLMNPRSTVXY";
  const l = () => letters[Math.floor(Math.random() * letters.length)];
  const d = () => Math.floor(Math.random() * 10);
  return `${l()}${d()}${l()}${d()}${l()}${d()}`;
};

export function randomSignupData() {
  const num = randDigits(4);
  return {
    email: `test${num}@test.com`,
    password: "Test1234",
  };
}

export function randomNameGender() {
  return {
    name: rand(firstNames),
    lastName: rand(lastNames),
    gender: rand(["M", "F"]),
  };
}

export function randomDateOfBirth() {
  const year = 1970 + Math.floor(Math.random() * 35);
  const month = Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return new Date(year, month, day);
}

export function randomPhoneAddress() {
  return {
    phone: `514${randDigits(7)}`,
    address: `${Math.floor(Math.random() * 9000) + 1000} ${rand(streets)}`,
    city: rand(cities),
    postalCode: randPostal(),
    country: "CA",
    province: "Québec",
  };
}

export function randomDriverLicense() {
  const now = new Date();
  const issueDate = new Date(now.getFullYear() - 3, Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28));
  const expiryDate = new Date(now.getFullYear() + 2, Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28));
  return {
    licenseNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${randDigits(4)}-${randDigits(6)}-${randDigits(2)}`,
    issueDate,
    expiryDate,
    category: rand(["5", "4A", "4B", "4C"]),
    mention: rand(["A", "B", "C", "F"]),
  };
}

const brands = ["Toyota", "Honda", "Ford", "Chevrolet", "Hyundai", "Kia", "Mazda", "Nissan", "Subaru", "Volkswagen"];
const models = ["Corolla", "Civic", "Focus", "Cruze", "Elantra", "Forte", "Mazda3", "Sentra", "Impreza", "Jetta"];
const colors = ["Noir", "Blanc", "Gris", "Rouge", "Bleu", "Argent", "Vert"];
const insuranceCompanies = ["Desjardins", "Intact", "Industrielle Alliance", "La Capitale", "SSQ", "Promutuel", "Beneva"];

export function randomVehicleDetails() {
  const now = new Date();
  const deliveryDate = new Date(now.getFullYear() - 1, Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28));
  const expirationDate = new Date(now.getFullYear() + 1, Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28));
  return {
    vehicleBrand: rand(brands),
    vehicleModel: rand(models),
    vehicleYear: String(2015 + Math.floor(Math.random() * 10)),
    vehicleColor: rand(colors),
    vehicleSerialNumber: `${randDigits(3)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${randDigits(4)}`,
    vehiclePlateNumber: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${randDigits(4)}`,
    vehicleNumeroCertificat: randDigits(13),
    vehicleDossierNumber: randDigits(8),
    vehicleCerticateDeliveryDate: deliveryDate.toISOString().split("T")[0],
    vehicleCerticateExpirationDate: expirationDate.toISOString().split("T")[0],
    vehicleNetWeight: String(1000 + Math.floor(Math.random() * 2000)),
    vehicleCylinder: String(1000 + Math.floor(Math.random() * 3000)),
    vehiclecategorieUsage: rand(["Promenade", "Commercial", "Agricole"]),
    vehicleEssieux: String(2 + Math.floor(Math.random() * 3)),
    vehicleOwnerFirstname: rand(firstNames),
    vehicleOwnerName: rand(lastNames),
    vehicleOwnerPhone: `514${randDigits(7)}`,
    vehicleOwnerAddress: `${Math.floor(Math.random() * 9000) + 1000} ${rand(streets)}`,
    vehicleOwnerCity: rand(cities),
    vehicleOwnerPostalCode: randPostal(),
    vehicleOwnerCountry: "CA",
    vehicleOwnerProvince: "Québec",
  };
}

export function randomInsuranceDetails() {
  const now = new Date();
  const expirationDate = new Date(now.getFullYear() + 1, Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28));
  return {
    insuranceNumber: randDigits(10),
    insuranceExpirationDate: expirationDate.toISOString().split("T")[0],
    insuranceFirmName: rand(insuranceCompanies),
    insuranceFirmPhone: `514${randDigits(7)}`,
    insuranceFirmAddress: `${Math.floor(Math.random() * 9000) + 1000} ${rand(streets)}`,
    insuranceFirmCity: rand(cities),
    insuranceFirmPostalCode: randPostal(),
    insuranceFirmCountry: "CA",
    insuranceFirmProvince: "Québec",
  };
}
