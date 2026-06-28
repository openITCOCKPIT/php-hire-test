import {Pipe, PipeTransform} from "@angular/core";
import * as moment from "moment";


@Pipe({
    name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform{
    constructor() {}

    transform(date: Date) {
        const dateMoment = moment(date);
        const format = "DD.MM.YYYY";

        return dateMoment.format(format);
    }
}