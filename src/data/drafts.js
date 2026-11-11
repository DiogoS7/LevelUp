/**
 * Prepared AI output for the built-in documents, so the live demo drafts a course offline with no API key.
 * It has the same shape a model is asked to return: each lesson point, quiz question and practice task
 * lists the numbers of the source sentences it came from. One point in each draft has no source on
 * purpose, to show how the review step catches something that is not in the document.
 */
export const sampleDrafts = {
  'lumeva-leaflet': {
    title: 'Lumeva in practice',
    lesson: {
      title: 'Lumeva in practice',
      points: [
        { text: 'Lumeva is a once-monthly injection that lowers LDL cholesterol.', sources: [1] },
        { text: 'It is for adults at high cardiovascular risk whose LDL cholesterol stays above target on a statin.', sources: [2] },
        { text: 'It is added to the current treatment and does not replace the statin.', sources: [3] },
        { text: 'In the VELA-2 trial it lowered LDL cholesterol by 52% more than placebo after 24 weeks, and the effect stayed steady for a year.', sources: [4, 5] },
        { text: 'Lumeva can replace a statin for patients who dislike taking tablets.', sources: [] },
        { text: 'Only discuss the approved use. Questions about other uses go to Medical Information.', sources: [12, 13] },
      ],
    },
    quiz: [
      {
        q: 'Who is Lumeva for?',
        options: [
          'Adults at high cardiovascular risk whose LDL stays above target on a statin',
          'Anyone who wants lower cholesterol without taking a statin',
          'Children with high cholesterol',
          'Patients with low blood pressure',
        ],
        answer: 0,
        sources: [2],
      },
      {
        q: 'What was the most common side effect?',
        options: ['Headache', 'A mild reaction where the injection was given', 'Muscle pain', 'Trouble sleeping'],
        answer: 1,
        sources: [6, 7],
      },
      {
        q: 'A patient missed a dose. What should they do?',
        options: [
          'Skip it and wait until next month',
          'Take two doses next month',
          'Take it as soon as they remember, then keep the usual day each month',
          'Stop the treatment',
        ],
        answer: 2,
        sources: [9],
      },
    ],
    practice: {
      title: 'Explain Lumeva in two minutes',
      text: 'With a colleague playing a cardiologist, explain who Lumeva is for and how patients take it with the pre-filled pen, using only the approved use.',
      sources: [2, 8, 12],
    },
  },
  'objections-guide': {
    title: 'Handling objections the right way',
    lesson: {
      title: 'Handling objections the right way',
      points: [
        { text: 'An objection usually means the doctor is interested but has a concern.', sources: [1] },
        { text: 'Use four steps: acknowledge the concern, explore it with an open question, answer with approved materials, then confirm.', sources: [2, 3, 4, 5, 6] },
        { text: 'When a doctor says a medicine is too expensive, ask what cost means for their patients before you answer.', sources: [8] },
        { text: 'Never offer discounts or talk about prices: pricing is handled by the market access team.', sources: [9] },
        { text: 'Always leave a free sample to win the doctor back.', sources: [] },
        { text: 'If you cannot answer a question, say so and offer to follow up.', sources: [13] },
      ],
    },
    quiz: [
      {
        q: 'What is the first of the four steps?',
        options: ['Answer straight away', 'Acknowledge the concern without arguing', 'Offer a discount', 'Change the subject'],
        answer: 1,
        sources: [2, 3],
      },
      {
        q: 'A doctor says a medicine is too expensive. What do you do first?',
        options: ['Offer a discount', 'Ask what cost means for their patients', 'Show the price list', 'End the visit'],
        answer: 1,
        sources: [8, 9],
      },
      {
        q: 'A doctor mentions a side effect you have not heard about. When do you report it to the safety team?',
        options: ['Within 24 hours', 'At the end of the month', 'Only if it sounds serious', 'Never, the doctor will do it'],
        answer: 0,
        sources: [12],
      },
    ],
    practice: {
      title: 'Practise the "my patients are fine" objection',
      text: 'With a colleague playing a doctor whose patients are fine on their current treatment, use the four steps and ask how many of those patients are still above their target.',
      sources: [2, 10, 11],
    },
  },
};
