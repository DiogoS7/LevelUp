/**
 * Built-in source documents for the Course studio. Solenne Biosciences, Lumeva, the VELA-2 trial and every
 * detail here are made up. Each document is written as paragraphs of sentences, so the sentence numbers the
 * course drafts point to are fixed (a test checks the splitter gives back exactly these sentences).
 */

export const sourceDocs = [
  {
    id: 'lumeva-leaflet',
    title: 'Lumeva product leaflet for the sales team',
    kind: 'Product leaflet',
    owner: 'Solenne Biosciences · Medical & Marketing',
    skill: 'sci-lumeva',
    paragraphs: [
      [
        'Lumeva (velanerab) is a once-monthly injection that lowers LDL cholesterol.',
        'It is for adults at high cardiovascular risk whose LDL cholesterol stays above target on a statin.',
        "Lumeva is added to the patient's current treatment and does not replace their statin.",
      ],
      [
        'In the VELA-2 trial, Lumeva lowered LDL cholesterol by 52% more than placebo after 24 weeks.',
        'The effect stayed steady for the whole year of the study.',
        'The most common side effect was a mild reaction where the injection was given.',
        'Most of these reactions went away on their own within two days.',
      ],
      [
        'Patients inject Lumeva themselves once a month with a pre-filled pen.',
        'If a dose is missed, the patient should take it as soon as they remember and then keep the usual day each month.',
        'The pen can be kept at room temperature for up to 30 days.',
      ],
      [
        'The typical Lumeva patient has had a heart attack or stroke and already takes a statin every day.',
        'Reps must only discuss Lumeva for this approved use.',
        'Questions about other uses must go to Medical Information.',
      ],
    ],
  },
  {
    id: 'objections-guide',
    title: "Handling a doctor's objections: a field guide",
    kind: 'Field guide',
    owner: 'Solenne Biosciences · Sales Excellence',
    skill: 'eng-objection',
    paragraphs: [
      [
        'Objections are normal and usually mean the doctor is interested but has a concern.',
        'Use four steps: acknowledge, explore, answer and confirm.',
        'First, acknowledge the concern without arguing, so the doctor feels heard.',
        'Then explore it with an open question to find the real reason behind it.',
        'Answer only with approved materials that fit that reason.',
        'Finally, confirm that your answer addressed the concern before you move on.',
      ],
      [
        'The most common objection is cost.',
        'When a doctor says a medicine is too expensive, ask what cost means for their patients before you answer.',
        'Never offer discounts or talk about prices, because pricing is handled by the market access team.',
      ],
      [
        'Another common objection is "my patients are fine on their current treatment."',
        'Ask how many of those patients are still above their target.',
        'If the doctor raises a side effect you have not heard about, report it to the safety team within 24 hours.',
        'If you cannot answer a question, say so and offer to follow up.',
      ],
    ],
  },
];

export const sourceDocById = Object.fromEntries(sourceDocs.map((d) => [d.id, d]));

/** The document as one text, paragraphs separated by a blank line. */
export const docText = (doc) => doc.paragraphs.map((p) => p.join(' ')).join('\n\n');
