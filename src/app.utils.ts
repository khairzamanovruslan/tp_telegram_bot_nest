interface substationUtilsResult {
  list: (tps) => string;
  coordinates: (tps) => [];
}

export function substationUtils(): substationUtilsResult {
  const list = (tps) => {
    return tps
      .map(
        (tp) =>
          `id: ${tp.id} \nТП: ${tp.name}\nКоординаты: ${tp.coordinates}\n\n`,
      )
      .join('');
  };

  const coordinates = (tps) => {
    return tps.map((tp) => tp.coordinates);
  };

  return { list, coordinates };
}
