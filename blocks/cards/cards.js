export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const picture = row.querySelector('picture');
    const anchor = row.querySelector('a');

    if (!anchor) { ul.append(li); return; }

    const a = document.createElement('a');
    a.href = anchor.href;

    if (picture) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'cards-card-image';
      imgWrap.append(picture);

      const body = document.createElement('div');
      body.className = 'cards-card-body';
      const p = document.createElement('p');
      p.textContent = anchor.textContent.trim();
      body.append(p);

      a.append(imgWrap, body);
    } else {
      li.className = 'cards-all-products';
      a.textContent = anchor.textContent.trim();
    }

    li.append(a);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
