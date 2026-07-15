import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'elipsis'
})
export class ElipsisPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: any, maxlen?: number): any {
    return (!maxlen || maxlen < 2 || !value || value.length <= maxlen)
      ? value : (value.substr(0, maxlen - 1) + '\u2026');
  }
}
@Pipe({
    name: 'mask'
})
export class MaskPipe implements PipeTransform {
  transform(value: string | number | undefined | null, char = 'x') {
    return char.repeat(value?.toString().length ?? 0)
  }
}

@Pipe({
    name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: string): any {
    return value?.toString().toLowerCase().split(".").map(frase => frase.trim())
      .map((frase, index, array) => frase.length === 0 ? (array.length > 1 && index + 1 < array.length ? (array[index + 1] === '' ? '.' : '. ') : '')
        : frase.charAt(0)?.toUpperCase() + frase?.substring(1) + (array.length > 1 && index + 1 < array.length ? (array[index + 1] === '' ? '.' : '. ') : ''))
      .join('').trim()
  }
}

@Pipe({
  name: 'striptags'
})
export class StripTagsPipe implements PipeTransform {
  transform(text: string, ...allowedTags: string[]): string {
    const etiquetas = `(?:.|\\s)*?`
    return allowedTags.length > 0
      ? text.replace(new RegExp(`<(?!\\/?(${allowedTags.join('|')})\\s*\\/?)[^>]+>`, 'g'), '')
      : text.replace(new RegExp(`<${etiquetas}>`, 'g'), '');
  }
}

@Pipe({
  name: 'normalize'
})
export class NormalizePipe implements PipeTransform {
  transform(text: string): string {
    return (text??'').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")
  }
}

@Pipe({
    name: 'errormsg'
})
export class ErrorMessagePipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: any, patternMsg?: string): string {
    if (!value) return ''
    let msg = '';
    for (const err in value) {
      switch (err) {
        case 'required': msg += 'Es obligatorio. '; break;
        case 'minlength': msg += `Como mínimo debe tener ${value[err].requiredLength} caracteres. `; break;
        case 'maxlength': msg += `Como máximo debe tener ${value[err].requiredLength} caracteres. `; break;
        case 'pattern': msg += (patternMsg ? patternMsg : 'El formato no es correcto') + '. '; break;
        case 'email': msg += 'El formato del correo electrónico no es correcto. '; break;
        case 'min': msg += `El valor debe ser mayor o igual a ${value[err].min}. `; break;
        case 'max': msg += `El valor debe ser inferior o igual a ${value[err].max}. `; break;
        default:
          if (typeof value[err] === 'string')
            msg += `${value[err]}${value[err].endsWith('.') ? '' : '.'} `;
          else if (typeof value[err]?.message === 'string')
            msg += `${value[err].message}${value[err].message.endsWith('.') ? '' : '.'} `;
          break;
      }
    }
    return msg.trim();
  }
}

@Pipe({
    name: 'error2text'
})
export class ErrorToTextPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: any): string {
    if (!value || (Array.isArray(value) && value.length === 0)) return ''
    let msg = '';
    for (const err of value) {
      if(err.message) {
        msg += err.message + (err.message.endsWith('.') ? ' ' : '. ')
        continue
      }
      switch (err.kind) {
        case 'required': msg += 'Es obligatorio. '; break;
        case 'minLength': msg += `Como mínimo debe tener ${err.minLength} caracteres. `; break;
        case 'maxLength': msg += `Como máximo debe tener ${err.maxLength} caracteres. `; break;
        case 'pattern': msg += 'El formato no es correcto.'; break;
        case 'email': msg += 'El formato del correo electrónico no es correcto. '; break;
        case 'min': msg += `El valor debe ser mayor o igual a ${err.min}. `; break;
        case 'max': msg += `El valor debe ser inferior o igual a ${err.max}. `; break;
        case 'minDate': msg += `La fecha debe ser posterior al ${err.minDate}.`; break;
        case 'maxDate': msg += `La fecha debe ser anterior al ${err.maxDate}.`; break;
        default: msg += `Error desconocido: ${err.kind}. `; break;
      }
    }
    return msg.trim();
  }
}

export const PIPES_CADENAS = [ElipsisPipe, CapitalizePipe, StripTagsPipe, NormalizePipe, ErrorMessagePipe,]
