import type { GlobalConfig } from 'payload'
import { colorField } from '../fields/color'
import { refresh } from '../hooks/revalidate'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'עמוד הבית',
  admin: { group: 'תוכן', livePreview: { url: '/' } },
  access: { read: () => true },
  hooks: { afterChange: [() => refresh('/')] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'פתיחה',
          fields: [
            {
              name: 'words',
              label: 'מילים אחרי Passion &',
              type: 'array',
              minRows: 1,
              maxRows: 6,
              labels: { singular: 'מילה', plural: 'מילים' },
              admin: { description: 'המילה מתחלפת בגלילה, ואיתה הרקע, תמונת הרקע וצבע ההדגשה.' },
              defaultValue: [
                { word: 'Expertise', bg: '#16141a', accent: '#d6a05b' },
                { word: 'Culture', bg: '#14243a', accent: '#8fb7e0' },
                { word: 'Flavor', bg: '#3a0f1c', accent: '#e0a96d' },
                { word: 'Lifestyle', bg: '#26331d', accent: '#e2c65e' },
              ],
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'word', label: 'מילה', type: 'text', required: true },
                    colorField('bg', 'רקע', '#16141a'),
                    colorField('accent', 'הדגשה', '#d6a05b'),
                  ],
                },
                {
                  name: 'image',
                  label: 'תמונת רקע',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { description: 'תמונה או וידאו מאחורי הסלוגן, מוחשכים כדי שהטקסט ייקרא. בלי תמונה: רקע בצבע שנבחר.' },
                },
              ],
            },
            {
              name: 'subtitle',
              label: 'משפט מתחת',
              type: 'text',
              defaultValue: 'אתרים בהתאמה אישית, מאפיון ועד ליווי, תחת קורת גג אחת.',
            },
          ],
        },
        {
          label: 'עבודות',
          fields: [
            {
              name: 'workTitle',
              label: 'כותרת',
              type: 'text',
              defaultValue: 'עבודות נבחרות',
              admin: { description: 'הפרויקטים שמסומנים "להציג בעמוד הבית" מוצגים כאן לפי הסדר ברשימת הפרויקטים.' },
            },
          ],
        },
        {
          label: 'שירותים',
          fields: [
            { name: 'servicesTitle', label: 'כותרת', type: 'text', defaultValue: 'הכל תחת קורת גג אחת' },
            {
              name: 'services',
              label: 'כרטיסים',
              type: 'array',
              labels: { singular: 'שירות', plural: 'שירותים' },
              defaultValue: [
                { title: 'אפיון', text: 'מבינים את העסק, את הקהל ואת המטרה, ובונים מבנה ותוכן לפני שמתחילים לעצב.', bg: '#f6f6f6', ink: '#111517' },
                { title: 'הקמת האתר', text: 'עיצוב ובנייה מותאמים לנייד ונגישים מהיום הראשון.', bg: '#ff7777', ink: '#111517' },
                { title: 'פיתוח ממשק', text: 'תוספים, אינטגרציות ורכיבים בהתאמה אישית, כשמה שקיים על המדף לא מספיק.', bg: '#32323a', ink: '#ffffff' },
                { title: 'ליווי מתמשך', text: 'אחסון, עדכונים, אבטחה ושיפורים לאורך זמן, עם כתובת אחת לכל שאלה.', bg: '#a54d4d', ink: '#ffffff' },
              ],
              fields: [
                { name: 'title', label: 'שם', type: 'text', required: true },
                { name: 'text', label: 'תיאור', type: 'textarea' },
                { type: 'row', fields: [colorField('bg', 'רקע הכרטיס', '#efe8de'), colorField('ink', 'טקסט הכרטיס', '#16141a')] },
              ],
            },
          ],
        },
        {
          label: 'עלינו',
          fields: [
            {
              name: 'aboutHeadline',
              label: 'משפט גדול',
              type: 'text',
              defaultValue: 'מאז 2010 בנינו מאות אתרים, כל אחד עם האופי של העסק שמאחוריו.',
              admin: { description: 'נצבע מילה אחרי מילה בגלילה.' },
            },
            {
              name: 'aboutBody',
              label: 'פסקה',
              type: 'textarea',
              defaultValue:
                'MyMuse הוקמה על ידי רוית שליוינסקי. אנחנו מאמינות שלכל עסק יש אופי ייחודי, ולכן כל לקוח מקבל יחס אישי והתאמה מדויקת.',
            },
          ],
        },
        {
          label: 'לקוחות',
          fields: [
            {
              name: 'clients',
              label: 'שמות לקוחות',
              type: 'array',
              labels: { singular: 'לקוח', plural: 'לקוחות' },
              defaultValue: ['HELIOS', 'GurGroup', 'Meteor Center', 'TEO', 'Jullius', 'Mosessco', 'Barantech', 'Benny Goren', 'Enosh', 'Little Fences', 'Samurai', 'Recanati', 'Margalit', 'WINECASE', 'Netofa', '3 Bears', 'Studio Gur', 'Agur', 'MOA Winery', 'Vinspiration', 'Firon', 'Gordon Pool'].map((name) => ({ name })),
              fields: [{ name: 'name', label: 'שם', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'יצירת קשר',
          fields: [{ name: 'contactTitle', label: 'כותרת', type: 'text', defaultValue: 'נדבר?' }],
        },
      ],
    },
  ],
}
