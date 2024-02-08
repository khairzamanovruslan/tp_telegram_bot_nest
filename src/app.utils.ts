interface substationUtilsResult {
  list: (tps) => string;
}

export function substationUtils(): substationUtilsResult {
  const list = (tps) => {
    return tps
      .map(
        (tp) =>
          `id: ${tp.id} \nТП: ${tp.fullName}\nНомер: ${tp.name}\nКоординаты: ${tp.coordinateFull}\nСсылка: ${tp.link}\n\n`,
      )
      .join('');
  };

  return { list };
}
