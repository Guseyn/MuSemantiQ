'use strict'

const compositions = [
  {
    compositionId: 'en-the-travellers-song',
    language: 'English',
    split: 'train',
    title: 'The Traveller’s Song',
    subtitle: 'For violin and piano'
  },
  {
    compositionId: 'en-two-sketches-op-12',
    language: 'English',
    split: 'train',
    title: 'Two Sketches, Op. 12',
    subtitle: 'For piano solo'
  },
  {
    compositionId: 'en-lanterns-at-dusk',
    language: 'English',
    split: 'heldOut',
    title: 'Lanterns at Dusk',
    subtitle: 'A nocturne for cello and piano'
  },
  {
    compositionId: 'fr-le-coeur-leger',
    language: 'French',
    split: 'train',
    title: 'Le Cœur léger',
    subtitle: 'Pour piano seul'
  },
  {
    compositionId: 'fr-reveries-d-automne-op-12',
    language: 'French',
    split: 'train',
    title: 'Rêveries d’automne, op. 12',
    subtitle: 'Trois esquisses pour flûte et harpe'
  },
  {
    compositionId: 'fr-les-etoiles-silencieuses',
    language: 'French',
    split: 'heldOut',
    title: 'Les Étoiles silencieuses',
    subtitle: 'Nocturne pour violoncelle et piano'
  },
  {
    compositionId: 'de-der-weg-durch-den-wald',
    language: 'German',
    split: 'train',
    title: 'Der Weg durch den Wald',
    subtitle: 'Für Klavier zu vier Händen'
  },
  {
    compositionId: 'de-erinnerung-an-die-strasse-op-12',
    language: 'German',
    split: 'train',
    title: 'Erinnerung an die Straße, op. 12',
    subtitle: 'Fünf Stücke für Violine und Klavier'
  },
  {
    compositionId: 'de-lichter-ueber-dem-see',
    language: 'German',
    split: 'heldOut',
    title: 'Lichter über dem See',
    subtitle: 'Nachtstück für Violoncelle und Orchester'
  },
  {
    compositionId: 'it-ricordi-d-estate',
    language: 'Italian',
    split: 'train',
    title: 'Ricordi d’estate',
    subtitle: 'Per pianoforte solo'
  },
  {
    compositionId: 'it-danza-della-pioggia-op-12',
    language: 'Italian',
    split: 'train',
    title: 'Danza della pioggia, op. 12',
    subtitle: 'Tre pezzi per flauto e arpa'
  },
  {
    compositionId: 'it-voci-nella-notte',
    language: 'Italian',
    split: 'heldOut',
    title: 'Voci nella notte',
    subtitle: 'Notturno per violoncello e orchestra'
  },
  {
    compositionId: 'es-cancion-de-la-nina',
    language: 'Spanish',
    split: 'train',
    title: 'Canción de la niña',
    subtitle: 'Para piano solo'
  },
  {
    compositionId: 'es-recuerdos-del-verano-op-12',
    language: 'Spanish',
    split: 'train',
    title: 'Recuerdos del verano, op. 12',
    subtitle: 'Tres piezas para flauta y arpa'
  },
  {
    compositionId: 'es-luces-sobre-el-rio',
    language: 'Spanish',
    split: 'heldOut',
    title: 'Luces sobre el río',
    subtitle: 'Nocturno para violonchelo y orquesta'
  },
  {
    compositionId: 'ru-vsyo-eshyo-sneg',
    language: 'Russian',
    split: 'train',
    title: 'Всё ещё снег',
    subtitle: 'Для фортепиано соло'
  },
  {
    compositionId: 'ru-les-posle-dozhdya-soch-12',
    language: 'Russian',
    split: 'train',
    title: 'Лес после дождя, соч. 12',
    subtitle: 'Три пьесы для скрипки и фортепиано'
  },
  {
    compositionId: 'ru-ogni-nad-rekoy',
    language: 'Russian',
    split: 'heldOut',
    title: 'Огни над рекой',
    subtitle: 'Ноктюрн для виолончели и оркестра'
  }
]

// Whole compositions are held out so a title or its sibling subtitle cannot
// leak into evaluation through another fixture from the same work.
export const titleSubtitleTextCorpus = Object.freeze(
  compositions.map(composition => Object.freeze(composition))
)

export default titleSubtitleTextCorpus
