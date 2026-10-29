(function (global) {
  'use strict';

  const LIMITS = {
    MEDIANO: { label: 'MEDIANO 18X27', width: 15, height: 20 },
    GRANDE: { label: 'GRANDE 18X36', width: 15, height: 31 },
    JUMBO: { label: 'JUMBO 25.5X41.3', width: 25.5, height: 41.3 }
  };
  const lastScreenPrompt = new WeakMap();
  const lastCategoryPrompt = new WeakMap();

  function numberValue(value) {
    const match = String(value ?? '').replace(',', '.').match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : null;
  }

  function getDimensions(placement) {
    const widthInput = document.getElementById(`dimension-w-${placement.id}`);
    const heightInput = document.getElementById(`dimension-h-${placement.id}`);
    return {
      width: numberValue(widthInput?.value ?? placement.width),
      height: numberValue(heightInput?.value ?? placement.height)
    };
  }

  function getPlacement(id) {
    return (global.placements || []).find((item) => String(item.id) === String(id));
  }

  function askScreen(placement, nextKey, message) {
    const dimensions = getDimensions(placement);
    const signature = `${dimensions.width}x${dimensions.height}:${nextKey}`;
    if (lastScreenPrompt.get(placement) === signature) return false;
    lastScreenPrompt.set(placement, signature);

    const accepted = global.confirm(message);
    if (accepted) {
      placement.screenSize = LIMITS[nextKey].label;
      placement.screenSizeKey = nextKey;
      placement.screenValidation = 'ACCEPTED';
    } else {
      placement.screenSize = '';
      placement.screenSizeKey = '';
      placement.screenValidation = 'REQUIRES_RESIZE';
      global.alert('Regresa al arte y ajusta sus dimensiones antes de continuar.');
    }
    return accepted;
  }

  function validateScreen(id) {
    const placement = getPlacement(id);
    if (!placement) return true;
    const { width, height } = getDimensions(placement);
    if (width === null || height === null) return true;

    // Width over 15 inches always takes priority and requires JUMBO.
    if (width > 15 && placement.screenSizeKey !== 'JUMBO') {
      return askScreen(
        placement,
        'JUMBO',
        `El arte mide ${width}\" de ancho y supera el límite de 15\" de MEDIANO y GRANDE. ¿Deseas usar la pantalla JUMBO 25.5X41.3 para producción?`
      );
    }

    if (width > LIMITS.JUMBO.width || height > LIMITS.JUMBO.height) {
      placement.screenSize = '';
      placement.screenSizeKey = '';
      placement.screenValidation = 'REQUIRES_RESIZE';
      global.alert('El arte supera también los límites de JUMBO (25.5\" de ancho × 41.3\" de alto). Regresa al arte y ajusta sus dimensiones.');
      return false;
    }

    if (height > LIMITS.GRANDE.height && placement.screenSizeKey !== 'JUMBO') {
      return askScreen(
        placement,
        'JUMBO',
        `El arte mide ${height}\" de alto y supera el límite de 31\" de GRANDE. ¿Deseas usar la pantalla JUMBO 25.5X41.3 para producción?`
      );
    }

    if (height > LIMITS.MEDIANO.height && height <= LIMITS.GRANDE.height
        && !['GRANDE', 'JUMBO'].includes(placement.screenSizeKey)) {
      return askScreen(
        placement,
        'GRANDE',
        `El arte mide ${height}\" de alto y supera el límite de 20\" de MEDIANO. ¿Deseas cambiar a la pantalla GRANDE 18X36?`
      );
    }

    if (!placement.screenSizeKey) {
      placement.screenSize = LIMITS.MEDIANO.label;
      placement.screenSizeKey = 'MEDIANO';
      placement.screenValidation = 'VALID';
    }
    return true;
  }

  function checkCategory(placement, promptUser = true) {
    if (!placement) return true;
    const stationCount = Array.isArray(placement.sequence) ? placement.sequence.length : 0;
    if (stationCount <= 37) {
      placement.category7Accepted = false;
      placement.category7Stations = stationCount;
      placement.category7PromptDismissedAt = stationCount;
      return true;
    }

    if (placement.category7Accepted && Number(placement.category7Stations) === stationCount) return true;
    if (Number(placement.category7PromptDismissedAt) === stationCount) return false;

    if (!promptUser) {
      placement.category7Accepted = false;
      return false;
    }

    const previousPrompt = lastCategoryPrompt.get(placement);
    if (previousPrompt === stationCount) return false;
    lastCategoryPrompt.set(placement, stationCount);

    const accepted = global.confirm(
      `La secuencia tiene ${stationCount} estaciones y supera las 37. Corresponde a la secuencia 7.0. ¿Deseas mostrar 7 (ESTACIONES ${stationCount}) en rojo en la categoría?`
    );
    placement.category7Accepted = accepted;
    placement.category7Stations = stationCount;
    placement.category7PromptDismissedAt = accepted ? null : stationCount;
    return accepted;
  }

  function validateBeforeExport(placements) {
    let valid = true;
    (Array.isArray(placements) ? placements : []).forEach((placement) => {
      if (!validateScreen(placement.id)) valid = false;
      checkCategory(placement, true);
    });
    return valid;
  }

  global.ScreenCategoryRules = { validateScreen, checkCategory, validateBeforeExport, limits: LIMITS };
})(window);
