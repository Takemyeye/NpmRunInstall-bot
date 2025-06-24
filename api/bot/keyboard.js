export const RESULTS_PER_PAGE = 5;

export function getKeyboard(videos, page) {
  const totalPages = Math.ceil(videos.length / RESULTS_PER_PAGE);

  const keyboard = videos
    .slice(page * RESULTS_PER_PAGE, (page + 1) * RESULTS_PER_PAGE)
    .map((video, index) => ([
      {
        text: video.title.slice(0, 50),
        callback_data: `select_${page * RESULTS_PER_PAGE + index}`
      }
    ]));

  const nav = [];

  if (page > 0) nav.push({ text: '⬅️', callback_data: `nav_${page - 1}` });
  nav.push({ text: `${page + 1} / ${totalPages}`, callback_data: `noop` });
  if ((page + 1) * RESULTS_PER_PAGE < videos.length)
    nav.push({ text: '➡️', callback_data: `nav_${page + 1}` });

  keyboard.push(nav);

  return { reply_markup: { inline_keyboard: keyboard } };
}
