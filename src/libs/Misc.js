import React from "react";
import LocalStorage from "../libs/LocalStorage";
import { i18n } from "../i18n";
import config from "../config";


export const isEmptyObject = (obj) => {
  return (
    obj ? // null and undefined check
      Object.keys(obj).length === 0 && // empty object check
      obj.constructor === Object // Object.keys(new Date()).length === 0; so we have to check it is not a Date
    :
      true
  );
};

export const isNull = (v) => {
  return (v == null);
};

export const isBoolean = (v) => {
  return typeof v === "boolean";
};

export const isString = (v) => {
  return (typeof v === "string");
};

export const isNumber = (v) => {
  return typeof v === "number" && isFinite(v);
};

export const isArray = (v) => {
  //return v && v.constructor === Array;
  return (typeof v === "object" && Array.isArray(v));
};

export const isObject = (v) => {
  return (typeof v === "object" && !Array.isArray(v));
};

export const objectsAreEqual = (o1, o2) => {
  const retval = Object.keys(o1).length === Object.keys(o2).length &&
    Object.keys(o1).every(p => o1[p] === o2[p])
    ;
  return retval;
};

// deeply merge objects with precedence to the source one
export const deepMergeObjects = (target, source) => {
  for (let key in source) {
    // check if the value is an object or an array
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      // if both target and source have the same key and they are objects, merge them recursively
      if (key in target) {
        Object.assign(source[key], deepMergeObjects(target[key], source[key]));
      }
    } else if (Array.isArray(source[key])) {
      // if the value is an array, merge arrays by concatenating them
      target[key] = (target[key] || []).concat(source[key]);
    }
  }
  // combine target and updated source
  return Object.assign(target || {}, source);
};

export const currencyFormat = (value, currencySymbol) => {
  return currencySymbol + " " + (value / 100).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
};

// check if consent is expired
const cookiesIsConsentExpired = (timestamp) => {
  const expirationTimeMilliseconds = config.cookies.expirationDays * 24 * 60 * 60 * 1000;
  return new Date().getTime() > (timestamp + expirationTimeMilliseconds);
};

// load consent from local storage
export const cookiesConsentLoad = () => {
  const storedData = LocalStorage.get(config.cookies.key);
  if (storedData) {
    //const parsedData = JSON.parse(storedData);
    if (!cookiesIsConsentExpired(storedData.timestamp)) {
      // setIsConsentGiven(storedData.consent);
      // setProfilingConsent(storedData.consent.profiling);
      // setStatisticsConsent(storedData.consent.statistics);
      // return;
      return {
        technical: storedData.consent.technical,
        profiling: storedData.consent.profiling,
        statistics: storedData.consent.statistics,
      };
    }
    // consent expired, remove it
    //LocalStorage.remove(config.cookies.key);
  }
  //setIsConsentGiven(null); // trigger consent modal display
  return null;
};

// save consent to local storage with current timestamp
export const cookiesConsentSave = (newConsent) => {
  const consentData = {
    consent: newConsent,
    timestamp: new Date().getTime(),
  };
  LocalStorage.set(config.cookies.key, consentData);
  //setIsConsentGiven(newConsent);
  return newConsent;
};

export const isValidRegex = (regexString) => {
  try {
    new RegExp(regexString);
    return true;
  } catch (err) {
    //console.warn("Regular expression is not valid:", err);
    return false;
  }
};

export const escapeRegex = (string) => {
  return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

export const encodeEmail = (email) => {
  let encodedEmail = "";
  
  if (!email) {
    return "";
  }

  function charToOctal(char) {
    return ("0" + char.charCodeAt(0).toString(8)).slice(-3);
  }

  for (let i = 0; i < email.length; i++) {
    let charNum = "000";
    let curChar = email.charAt(i);
    if (curChar.match(/[a-z0-9& _\-@.]/i)) charNum = charToOctal(curChar);
    if (charNum === "000") {
      encodedEmail += curChar;
    } else {
      encodedEmail += "&#" + charNum + ";";
    }
  }
  return React.createElement("span", { dangerouslySetInnerHTML: { __html: encodedEmail } });
};

/**
 * @param {Number} seconds 
 * @returns {String} a human text representation of a duration in seconds
 *
 * Examples:
 * console.log(convertSeconds());            // "instant"
 * console.log(convertSeconds(0));           // "instant"
 * console.log(convertSeconds(45));          // "45 seconds"
 * console.log(convertSeconds(120));         // "2 minutes"
 * console.log(convertSeconds(3600));        // "1 hour"
 * console.log(convertSeconds(86400));       // "1 day"
 * console.log(convertSeconds(604800));      // "1 week"
 * console.log(convertSeconds(2592000));     // "1 month"
 * console.log(convertSeconds(31557600));    // "1 year"
 * console.log(convertSeconds(3155760000));  // "1 century"
 */
export const secondsToHumanDuration = (seconds) => {
  seconds = Math.floor(seconds ?? 0);
  let t = i18n.t;

  const timeUnits = [
    { unit: t("century"), units: t("centuries"), seconds: 60 * 60 * 24 * 365.25 * 100 },
    { unit: t("year"), units: t("years"), seconds: 60 * 60 * 24 * 365.25 },
    { unit: t("month"), units: t("months"), seconds: 60 * 60 * 24 * 30.44 },
    { unit: t("week"), units: t("weeks"), seconds: 60 * 60 * 24 * 7 },
    { unit: t("day"), units: t("days"), seconds: 60 * 60 * 24 },
    { unit: t("hour"), units: t("hours"), seconds: 60 * 60 },
    { unit: t("minute"), units: t("minutes"), seconds: 60 },
    { unit: t("second"), units: t("seconds"), seconds: 1 },
    { unit: t("instant"), units: t("instant"), seconds: 0 },
  ];

  for (const { unit, units, seconds: unitSeconds } of timeUnits) {
    if (seconds >= unitSeconds) {
      const value = Math.floor(seconds / unitSeconds);
      return value + " " + (value !== 1 ? units : unit);
    }
  }
};

export const setupCustomConsole = () => {
  if (!("devAlert" in console)) {
    console.devAlert = message => {
      if (config.mode.development) {
        console.info("%c" + message, "color: red; -webkit-text-stroke: 2px black; font-size: 64px; font-weight: bold;");
      }
    };
  }
};
