/**
 * Created by felix on 09.05.16.
 */


import { InfoItem } from './infoitem';

export class ActionItem extends InfoItem{
    constructor(parentTopic, source) {   // constructs obj from item ID or document
        super(parentTopic, source);

        if (this._infoItemDoc.isOpen == undefined) {
            this._infoItemDoc.isOpen = true;
        }
    }

    // ################### object methods

    /**
     * Gets the date of the detail item
     * at the given index.
     *
     * @param index position in the details array (0 if undefined)
     * @returns {boolean|string} false (if date is not given) or date as ISO8601 string.
     */
    getDateFromDetails (index) {
        if (index === undefined) index = 0;
        let details = this._infoItemDoc.details;
        if (details.length > index && details[index].hasOwnProperty("date")) {
            return details[index].date;
        }
        return false;
    }

    /**
     * Gets the text of the detail item
     * at the given index.
     *
     * @param index position in the details array (0 if undefined)
     * @returns {string}
     */
    getTextFromDetails (index) {
        if (index === undefined) index = 0;
        let details = this._infoItemDoc.details;
        if (details.length > 0 && details[index].hasOwnProperty("text")) {
            return details[index].text;
        }
        return "";
    }

    toggleState () {    // open/close
        this._infoItemDoc.isOpen = !this._infoItemDoc.isOpen;
    }
}
