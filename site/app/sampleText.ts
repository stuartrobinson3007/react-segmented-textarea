const assignIdsToSegments = (segments: string[]) => {
  return segments.map((segment) => ({
    id: Math.random().toString(36).substr(2, 9),
    text: segment,
  }));
};

const splitTextIntoSegmentsAtRandomSpaces = (text: string) => {
  const words = text.split(' ');

  let segmentLength = 0;

  let wordCount = words.length;

  const segments = [] as string[];

  while (wordCount > 0) {
    segmentLength = Math.floor(Math.random() * 10) + 10;
    segments.push(words.splice(0, segmentLength).join(' '));
    wordCount -= segmentLength;
  }

  return segments;
};

const sample = `When Mr. Bilbo Baggins of Bag End announced that he would shortly be celebrating his eleventy-first birthday with a party of special magnificence, there was much talk and excitement in Hobbiton. Bilbo was very rich and very peculiar, and had been the wonder of the Shire for sixty years, ever since his remarkable disappearance and unexpected return. The riches he had brought back from his travels had now become a local legend, and it was popularly believed, whatever the old folk might say, that the Hill at Bag End was full of tunnels stuffed with treasure. And if that was not enough for fame, there was also his prolonged vigour to marvel at. Time wore on, but it seemed to have little effect on Mr. Baggins. At ninety he was much the same as at fifty. At ninety-nine they began to call him well-preserved, but unchanged would have been nearer the mark. There were some that shook their heads and thought this was too much of a good thing; it seemed unfair that anyone should possess (apparently) perpetual youth as well as (reputedly) inexhaustible wealth. ‘It will have to be paid for,’ they said. ‘It isn’t natural, and trouble will come of it!’`;

export const segmentedSample = [
  {
    id: 'wi7xfwr9v',
    text: 'When Mr. Bilbo Baggins of Bag End announced that he would shortly',
  },
  {
    id: 'w8w1403kz',
    text: 'be celebrating his eleventy-first birthday with a party of special magnificence, there was much talk and',
  },
  {
    id: '3tc1d5go9',
    text: 'excitement in Hobbiton. Bilbo was very rich and very peculiar, and',
  },
  {
    id: 'c7own3v3e',
    text: 'had been the wonder of the Shire for sixty years, ever since his remarkable disappearance',
  },
  {
    id: 'ko07pipbl',
    text: 'and unexpected return. The riches he had brought back from his travels had now',
  },
  {
    id: '7b8qds2db',
    text: 'become a local legend, and it was popularly believed, whatever the',
  },
  { id: 'jb00j750e', text: 'old folk might say, that the Hill at Bag End was' },
  {
    id: 'pzlz7kmxe',
    text: 'full of tunnels stuffed with treasure. And if that was not enough for fame, there was also his prolonged',
  },
  {
    id: 'pth4y2ekq',
    text: 'vigour to marvel at. Time wore on, but it seemed to have little',
  },
  {
    id: '99zxoc9uz',
    text: 'effect on Mr. Baggins. At ninety he was much the same as at fifty. At ninety-nine they began',
  },
  {
    id: '77kvsfbpv',
    text: 'to call him well-preserved, but unchanged would have been nearer the mark. There',
  },
  {
    id: 'yvuotnd5r',
    text: 'were some that shook their heads and thought this was',
  },
  {
    id: '2z3yjf8ep',
    text: 'too much of a good thing; it seemed unfair that anyone should possess (apparently)',
  },
  {
    id: '8v0pon7ot',
    text: 'perpetual youth as well as (reputedly) inexhaustible wealth. ‘It will have to be paid for,’ they',
  },
  {
    id: 'k752etgih',
    text: 'said. ‘It isn’t natural, and trouble will come of it!’',
  },
];
