import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
	const fabulas = await getCollection('fabulas', ({ data }) => !data.borrador);
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: fabulas.map((fabula) => ({
			title: fabula.data.titulo,
			description: fabula.data.resumen,
			pubDate: fabula.data.fecha,
			customData: `<dc:creator><![CDATA[${fabula.data.autor}]]></dc:creator>`,
			link: `/fabulas/${fabula.id}/`,
		})),
		xmlns: {
			dc: 'http://purl.org/dc/elements/1.1/',
		},
	});
}
