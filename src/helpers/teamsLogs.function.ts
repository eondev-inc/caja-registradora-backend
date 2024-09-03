// @ts-check
import fetch from 'node-fetch';
import { DateTime } from 'luxon';
import { version } from '../../package.json';
import { isNotUndefinedAndBlank } from './isNotUndefined';

const ambiente = process.env.NODE_ENV || 'develop';
const { TEAMS_ERROR_LOG, TEAMS_INFO_LOG } = process.env;

const deleteBodyOfOptionsFetch = (optionFetch) => {
  const fixOptionFetch = JSON.parse(optionFetch);
  delete fixOptionFetch.body;
  delete fixOptionFetch.data;
  return JSON.stringify(fixOptionFetch);
};

const haveBodyOptions = (optionFetch) => {
  if (!optionFetch) {
    return false;
  }
  if (typeof optionFetch === 'object') {
    if (Object.keys(optionFetch).length > 0) {
      return !!optionFetch.body;
    }
    return false;
  }
  if (typeof optionFetch === 'string') {
    return !!JSON.parse(optionFetch).body;
  }
  return false;
};
function typeOfMessage(data, isInfo, shortError, environment, origin) {
  const {
    id,
    code,
    url,
    path,
    method,
    message,
    optionFetch,
    bodyRecibe,
    additionalInfo,
    bodyCall,
    completeError,
  } = data;

  let newOptionFetch, facts;
  // // TODO: verificar funcion
  // console.log('OPTION EN TEAMS LOG', optionFetch);
  const haveBody = haveBodyOptions(optionFetch);
  if (!isInfo && haveBody) {
    newOptionFetch = deleteBodyOfOptionsFetch(optionFetch);
  } else {
    newOptionFetch = optionFetch;
  }
  if (isInfo && shortError) {
    facts = [
      {
        name: 'Path',
        value: path,
      },
      {
        name: 'Mensaje',
        value: message,
      },
      {
        name: 'Data Recibe',
        value: bodyRecibe,
      },
    ];
  } else if (shortError) {
    facts = [
      {
        name: 'Id Request',
        value: id,
      },
      {
        name: 'Code',
        value: code,
      },
      {
        name: 'Mensaje',
        value: message,
      },
      {
        name: 'Path',
        value: path,
      },
      {
        name: 'URL To Call',
        value: url,
      },
      {
        name: 'Options To Call',
        value: newOptionFetch,
      },
      {
        name: 'body To Call',
        value: bodyCall,
      },
      {
        name: 'CompleteError',
        value: completeError,
      },
    ];
  } else {
    facts = [
      {
        name: 'Id Request',
        value: id,
      },
      {
        name: 'Code',
        value: code,
      },
      {
        name: 'Mensaje',
        value: message,
      },
      {
        name: 'Path',
        value: path,
      },
      {
        name: 'Método',
        value: method,
      },
      {
        name: 'Data Recibe',
        value: bodyRecibe,
      },
      {
        name: 'URL To Call',
        value: url,
      },
      {
        name: 'Options To Call',
        value: newOptionFetch,
      },
      {
        name: 'body To Call',
        value: bodyCall,
      },
      {
        name: 'CompleteError',
        value: completeError,
      },
    ];
  }
  if (isNotUndefinedAndBlank(additionalInfo)) {
    facts = facts.concat([
      {
        name: 'Additional Info',
        value: additionalInfo,
      },
    ]);
  }
  return {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    themeColor: '0076D7',
    summary: `${isInfo ? 'INFO Log' : 'ERROR Log'} en Ambiente [_${environment}_]`,
    sections: [
      {
        // eslint-disable-next-line max-len
        activityTitle: `[_${environment.toUpperCase()}_] ${
          isInfo ? 'INFO Log' : 'ERROR Log'
        } - Proyecto *${origin.toUpperCase()}* - Version ${version}`,
        // eslint-disable-next-line max-len
        activitySubtitle: `Fecha: ${DateTime.now().setZone('America/Santiago').toFormat('dd-MM-yyyy')} \n Hora: ${DateTime.now()
          .setZone('America/Santiago')
          .toFormat('HH:mm:ss:ms')}`,
        activityImage: 'https://imedfarmacia.mimed.com/favicon.png',
        facts,
        markdown: true,
      },
    ],
    potentialAction: [],
  };
}
const toTeams = async (data, shortError = false) => {
  let urlCall = '',
    isInfo = false;
  const newData = data;
  if (!data.id || data.id === undefined || data.id === 'undefined') {
    newData.id = 'N/I';
  }
  if (
    data.isInfo ||
    data.code === 100 ||
    data.code === 200 ||
    data.code === 201
  ) {
    urlCall = TEAMS_INFO_LOG;
    isInfo = true;
  } else {
    if (data.code === undefined || data.code === 'undefined') {
      newData.code = 'N/I';
    }
    urlCall = TEAMS_ERROR_LOG;
    isInfo = false;
  }

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      typeOfMessage(
        newData,
        isInfo,
        shortError,
        data.environment ?? ambiente,
        data.origin ?? 'local',
      ),
    ),
  };
  return fetch(urlCall, fetchOptions)
    .then((res) => {
      if (res.status !== 200) throw res;
      // eslint-disable-next-line no-console
      const message = `Successfully send message in channel ${isInfo ? 'INFO Log' : 'ERROR Log'} Teams`;
      console.log(message);
      return { status: true, message };
    })
    .catch((err) => {
      const showError = JSON.stringify(err.statusText || err.message);
      // eslint-disable-next-line no-console
      const message = `error en envío de información a Teams: ${isInfo ? 'INFO Log' : 'ERROR Log'}`;
      console.error(message, showError);
      console.error('data a Enviar', JSON.stringify(fetchOptions));
      return { status: false, message, showError };
    });
};

export { toTeams };
