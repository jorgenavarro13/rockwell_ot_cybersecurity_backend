import pg from '../db.js';
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json" with { type: "json" };

countries.registerLocale(en);

const countryList = Object.entries(
  countries.getNames("en", { select: "official" })
).map(([code, name]) => ({
  code,
  name,
  flag: `https://flagcdn.com/w40/${code.toLowerCase()}.png`,
}));


export async function seedCountries() {
    for (const country of countryList) {
        await pg`
        INSERT INTO countries (code, name, logo)
        VALUES (${country.code}, ${country.name}, ${country.flag})
        `;
        console.log(`${country.code},${country.name},${country.flag}`);
    }
}