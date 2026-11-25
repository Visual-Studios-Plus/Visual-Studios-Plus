import media from '../../data/caseMedia.js';
import { storyImg } from './CaseStories.jsx';

/*
 * A brand's title slide, set before its case opener: the brand colour, the
 * name and category in giant serif type, the product cut-out standing between
 * the two words, the logo and the campaign copy at the right. Static, by
 * design: no entrance or scroll motion.
 */
export default function BrandCover( { s, cat } ) {
	const c = s.cover;
	const logo = media[ s.title ]?.mark;
	return (
		<section className="cpSlide cpCover" data-slide={ `${ s.word } — cover` } data-cat={ cat }
			style={ { '--cv-bg': c.bg } } aria-label={ `${ s.client }: ${ s.title }` }>
			<p className="cpCover_word cpCover_word--top" aria-hidden="true">{ c.top }</p>
			<p className="cpCover_word cpCover_word--bottom" aria-hidden="true">{ c.bottom }</p>
			<img className="cpCover_cut" src={ storyImg( c.cut ) } alt={ `${ s.client } product` } decoding="async" />
			<div className="cpCover_side">
				{ logo && <img className="cpCover_logo" src={ logo } alt={ s.client } /> }
				<p className="cpCover_text">{ s.text }</p>
			</div>
		</section>
	);
}
