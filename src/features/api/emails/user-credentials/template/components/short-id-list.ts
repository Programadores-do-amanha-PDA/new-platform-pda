const shortIDList = (shortIds: string[]) => {
  return `<ul class="dark-text-gray-50" style="box-sizing: border-box; margin: 0 auto; display: flex; width: max-content; list-style-type: none; flex-wrap: wrap; justify-content: center; padding: 0 16px; color: #1f2937">${shortIds.join(
    " "
  )}</ul>`;
};

export default shortIDList;
