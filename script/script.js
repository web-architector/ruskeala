// Скрипт для подгрузки последних топ фото по данному тегу
document.addEventListener('DOMContentLoaded', getInstagramPhotos);

function getInstagramPhotos() {
    'use strict';
    const instagramSection = document.getElementById('instagram');
    const topErrorURL = [ // НАбор url'ов фото инстаграмма  на случай ошибки запроса
        'https://scontent-hel2-1.cdninstagram.com/v/t51.2885-15/e35/87331319_560967561174624_3302476670513604986_n.jpg?_nc_ht=scontent-hel2-1.cdninstagram.com&_nc_cat=100&_nc_ohc=sLy0VwRMw84AX_7hiMN&oh=94da56e39a4a69254f75aff86a3437cc&oe=5EF1D88C',
        'https://scontent-hel2-1.cdninstagram.com/v/t51.2885-15/e35/89440865_528094818087490_1130944070625177089_n.jpg?_nc_ht=scontent-hel2-1.cdninstagram.com&_nc_cat=110&_nc_ohc=bPklu792Em8AX8p6uEx&oh=92db890bc172da8073df1f7edd853066&oe=5EF02C9E',
        'https://scontent-hel2-1.cdninstagram.com/v/t51.2885-15/sh0.08/e35/p750x750/73206258_2510334805866465_7376018029937913638_n.jpg?_nc_ht=scontent-hel2-1.cdninstagram.com&_nc_cat=109&_nc_ohc=2oZ084ZnpvkAX-b4uAm&oh=38bc0d5ea5bcf2b2d3f61fbd10a3ea5e&oe=5EF04AB1'
    ];
    console.log('###: instagram= ', instagram);
    let __DEBUG_HTML = '';

    function fetchScope(scope = 'locations', scopeName) {
        return fetch(`https://www.instagram.com/explore/${ scope }/${ scopeName }/`)
            .then(res => res.text())
            .then(txt => {
                __DEBUG_HTML = txt;
                const doc = parseInstagramExplorePage(txt);
                const sharedData = extractSharedData(doc);
                // console.log('###: sharedData= ', sharedData);
                const top9 = sharedData.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_top_posts.edges;
                // console.log('###: top9= ', top9);
                const sorted = _.sortBy(top9, item => item.node.edge_liked_by.count);
                // console.log('###: sorted= ', sorted);
                const last3Top = sorted.slice(-3);
                // console.log('###: last3Top= ', last3Top);
                return last3Top;
            })
            .catch(e => {
                console.log('Was unable to send request in current location, or there was another kind of error. Please see console.')
                console.debug(e);
            });
    }

    function parseInstagramExplorePage(txt) {
        const dp = new DOMParser();
        return dp.parseFromString(txt, "text/html");
    }

    function extractSharedData(doc) {
        const scs = Array.from(doc.querySelectorAll('script'));
        const sharedDataRawText = scs.filter(sc =>
            sc.textContent.indexOf('_sharedData') > -1
        )[0];

        if (sharedDataRawText) {
            const sharedDataJSONText = sharedDataRawText.textContent.trim().match(/\=\ (.*);/)[1];
            let sharedData;
            try {
                sharedData = JSON.parse(sharedDataJSONText);
            } catch (e) {
                alert('Failed to parse data. See `window.__FAIL_TXT`');
                window.__FAIL_TXT = sharedDataJSONText;
            }
            return sharedData;
        }
    }
    // Создаем разметку для 3-х фотографий и внедряем ее в код страницы
    const createInstagramTopHTML = (topURLs) => {
        instagramSection.style.display = 'grid';
        const instagramTopImages = topURLs.map(url => `<div class="instagram__item"><img class="instagram__img"
                                          src=${ url }
                                          alt="Instagram picture"
                                           loading="lazy"></div>`);
        instagramSection.insertAdjacentHTML('beforeend', instagramTopImages.join(''))
    };

    fetchScope('tags', 'рускеала')
        .then(data => {
            // debugger;
            // console.log('###: data= ', data);
            const topURLs = data.map(media => media.node.thumbnail_resources.pop().src);
            // console.log('###: topURLs= ', topURLs);
            createInstagramTopHTML(topURLs)

        })
        .catch(
            e => {
                console.debug(e);
                console.log('###: Не удалось получить актуальные данные с instagram.com. Будут показаны фото по умолчанию');
                createInstagramTopHTML(topErrorURL);
            }
        );

};