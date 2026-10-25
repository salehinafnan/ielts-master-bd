-- =========================================================================
-- IELTS Master BD - Mock Tests & Cambridge Companion Seed Data
-- =========================================================================

-- Ensure UUID extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- A) Academic Reading Mock Test 1 (Full Mock, Free, 40 Questions)
-- -------------------------------------------------------------------------
INSERT INTO public.tests (
  id,
  title,
  test_category,
  module_type,
  is_premium,
  content_json,
  answer_key_json
)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'Academic Reading Mock Test 1',
  'full_mock',
  'reading',
  false,
  $_JSON_${
  "sections": [
    {
      "sectionNumber": 1,
      "title": "Section 1: The History of Chocolate",
      "passageHtml": "<p>For thousands of years, chocolate has held a revered status among human civilizations. The story of chocolate began in ancient Mesoamerica, present-day Mexico and Central America, where wild cacao trees flourished in tropical rainforests. Botanical and archaeological evidence suggests that the Olmec civilization was the first documented culture to cultivate cacao plants around 1500 BCE. They harvested the large, colorful pods, extracted the bitter seeds, and ground them into a ceremonial paste.</p><p>Following the Olmecs, the Maya developed an intricate chocolate culture. Unlike the sweet confectionery enjoyed today, ancient Mayan chocolate was consumed exclusively as a bitter, frothy liquid. The Maya harvested cacao beans, fermented them, roasted them over clay grills, and pulverized them between volcanic stones. They mixed this paste with water, fiery chili peppers, and cornmeal, pouring the mixture repeatedly between tall vessels from shoulder height until a thick, luxurious froth formed on top. Cacao was considered divine—a sacred gift from the gods associated with Quetzalcoatl. It was consumed during royal weddings, religious sacrifices, and diplomatic summits.</p><p>Because cacao beans were rare, prized, and portable, they functioned as an official currency throughout Mesoamerica. In Aztec markets, one could purchase a turkey hen for one hundred cacao beans, a freshly picked avocado for three beans, and the daily labor of a porter for twenty beans. When Spanish conquistador Hernán Cortés arrived at the Aztec capital of Tenochtitlan in 1519, Emperor Montezuma II reportedly consumed dozens of golden goblets of frothy cacao every day before visiting his court.</p><p>Upon returning to Spain, Spanish explorers initially found the unsweetened beverage repulsive. However, once Spanish royal chefs heated the liquid and blended it with cane sugar, vanilla, and cinnamon, chocolate became an elite sensation. For over a century, Spain kept the secret of chocolate preparation hidden from rival European powers. When chocolate houses finally opened in London, Paris, and Amsterdam in the seventeenth century, a single cup cost more than an ordinary laborer earned in a week, restricting its consumption strictly to the royal court and aristocracy.</p><p>The transformation of chocolate from a luxury liquid into an accessible solid food occurred during the Industrial Revolution. In 1828, Dutch chemist Coenraad van Houten patented the hydraulic cocoa press, which squeezed out almost half the natural fat—cocoa butter—from pulverized beans, leaving behind a fine powder that could easily dissolve in milk or water. In 1847, British confectioner J.S. Fry & Sons combined cocoa powder, sugar, and melted cocoa butter to cast the first commercially mass-produced chocolate bar. Thirty years later in Switzerland, Rodolphe Lindt invented the conching machine, which continuously rolled chocolate paste for seventy-two hours, producing the velvety, melt-in-the-mouth texture enjoyed globally today.</p>",
      "questions": [
        {
          "questionNumber": 1,
          "category": "TFNG",
          "promptText": "The Olmec civilization was the first documented culture to cultivate cacao plants.",
          "correctAnswers": ["TRUE", "T"],
          "explanation": "Paragraph 1 states: 'botanical and archaeological evidence suggests that the Olmec civilization was the first documented culture to cultivate cacao plants around 1500 BCE.'"
        },
        {
          "questionNumber": 2,
          "category": "TFNG",
          "promptText": "Mayan chocolate drinks were sweetened with sugar cane.",
          "correctAnswers": ["FALSE", "F"],
          "explanation": "Paragraph 2 states the drink was 'a bitter, frothy liquid' mixed with water, chili peppers, and cornmeal. Sugar cane was not introduced until European contact."
        },
        {
          "questionNumber": 3,
          "category": "TFNG",
          "promptText": "Cacao beans were occasionally used as a form of currency in Mesoamerican markets.",
          "correctAnswers": ["TRUE", "T"],
          "explanation": "Paragraph 3 explicitly confirms: 'cacao beans were rare, prized, and portable, they functioned as an official currency throughout Mesoamerica.'"
        },
        {
          "questionNumber": 4,
          "category": "TFNG",
          "promptText": "Christopher Columbus immediately recognized the commercial value of cacao upon finding it.",
          "correctAnswers": ["FALSE", "F"],
          "explanation": "Paragraph 4 explains that Spanish explorers initially found the unsweetened beverage repulsive until sweetened with cane sugar in Spain."
        },
        {
          "questionNumber": 5,
          "category": "TFNG",
          "promptText": "Spanish conquerors kept the preparation of chocolate secret from other European nations for over a century.",
          "correctAnswers": ["TRUE", "T"],
          "explanation": "Paragraph 4 states: 'For over a century, Spain kept the secret of chocolate preparation hidden from rival European powers.'"
        },
        {
          "questionNumber": 6,
          "category": "TFNG",
          "promptText": "The Dutch inventor Coenraad van Houten developed a method to extract cacao butter using steam engines.",
          "correctAnswers": ["NOT GIVEN", "NG"],
          "explanation": "Paragraph 5 mentions he patented the hydraulic cocoa press, but no mention is made of steam engines."
        },
        {
          "questionNumber": 7,
          "category": "TFNG",
          "promptText": "Solid chocolate bars became affordable to working-class Europeans during the late nineteenth century.",
          "correctAnswers": ["TRUE", "T"],
          "explanation": "Paragraph 5 details the mass-production transition: 'The transformation of chocolate from a luxury liquid into an accessible solid food occurred during the Industrial Revolution.'"
        },
        {
          "questionNumber": 8,
          "category": "FILL_BLANKS",
          "promptText": "Ancient Mesoamericans mixed ground cacao with water, chili peppers, and [cornmeal] to create a sacred beverage.",
          "correctAnswers": ["cornmeal", "maize"],
          "explanation": "Paragraph 2 notes they mixed the paste with 'water, fiery chili peppers, and cornmeal'."
        },
        {
          "questionNumber": 9,
          "category": "FILL_BLANKS",
          "promptText": "In seventeenth-century Europe, high prices meant chocolate was restricted to the [royal court] and nobility.",
          "correctAnswers": ["royal court", "aristocracy"],
          "explanation": "Paragraph 4 states high cost was 'restricting its consumption strictly to the royal court and aristocracy'."
        },
        {
          "questionNumber": 10,
          "category": "FILL_BLANKS",
          "promptText": "The hydraulic press invented in 1828 extracted almost half of the natural [fat] from roasted beans.",
          "correctAnswers": ["fat", "cocoa butter"],
          "explanation": "Paragraph 5 states the press 'squeezed out almost half the natural fat—cocoa butter'."
        },
        {
          "questionNumber": 11,
          "category": "FILL_BLANKS",
          "promptText": "In 1847, British confectioner J.S. Fry & Sons manufactured the first commercially available chocolate [bar].",
          "correctAnswers": ["bar", "chocolate bar"],
          "explanation": "Paragraph 5 notes they combined ingredients 'to cast the first commercially mass-produced chocolate bar'."
        },
        {
          "questionNumber": 12,
          "category": "FILL_BLANKS",
          "promptText": "Rodolphe Lindt invented a mechanical process called [conching] to yield a smoother mouthfeel.",
          "correctAnswers": ["conching"],
          "explanation": "Paragraph 5 describes Lindt inventing 'the conching machine, which continuously rolled chocolate paste for seventy-two hours'."
        },
        {
          "questionNumber": 13,
          "category": "FILL_BLANKS",
          "promptText": "Over half of the world's contemporary raw cacao supply is harvested in West [Africa].",
          "correctAnswers": ["Africa"],
          "explanation": "West Africa produces over sixty percent of current global cocoa supplies."
        }
      ]
    },
    {
      "sectionNumber": 2,
      "title": "Section 2: Urban Farming Innovations",
      "passageHtml": "<p><strong>Paragraph A:</strong> By 2050, the human population residing in urban agglomerations is projected to surpass 6.5 billion. Meeting the nutritional demands of these swelling cities presents a colossal ecological dilemma. Conventional open-field agriculture currently accounts for nearly seventy percent of all freshwater withdrawals globally, triggers catastrophic deforestation, and causes severe topsoil degradation through synthetic pesticide and fertilizer runoff. Furthermore, long-distance supply chains generate immense carbon footprints as perishable produce travels thousands of kilometers before reaching grocery shelves.</p><p><strong>Paragraph B:</strong> In response to these pressing crises, agricultural architects and agronomists have pioneered vertical farming—the cultivation of crops in vertically stacked layers inside controlled indoor environments. By repurposing abandoned warehouses, subterranean parking structures, and retrofitted shipping containers within city cores, vertical farms utilize spatial architecture rather than expansive terrestrial acreage. A single ten-story indoor facility can yield agricultural output equivalent to hundreds of acres of rural farmland while occupying a negligible urban footprint.</p><p><strong>Paragraph C:</strong> The mechanical backbone of modern vertical agriculture comprises closed-loop hydroponic and aeroponic systems. In hydroponics, plant roots are submerged in oxygenated, mineral-infused water without any soil. Aeroponics takes this efficiency even further by suspending root structures in mid-air and misting them intermittently with a nutrient aerosol. Because these closed-loop mechanisms continuously filter, sterilize, and recirculate moisture, they consume up to ninety-five percent less water than conventional irrigation methods.</p><p><strong>Paragraph D:</strong> Lighting technology has also experienced quantum leaps. Early indoor growing operations relied on high-pressure sodium fixtures that generated excessive heat and consumed vast electrical loads. Today, hyper-efficient solid-state Light Emitting Diodes (LEDs) deliver tailored light spectrums—specifically optimized red and blue wavelengths—that accelerate photosynthesis while minimizing energy waste. Intelligent sensors monitor humidity, carbon dioxide concentrations, and ambient temperature, automatically calibrating microclimates for optimal plant growth.</p><p><strong>Paragraph E:</strong> Locating food production in close proximity to end consumers eliminates the phenomenon known as 'food miles.' Crops can be harvested at peak nutritional ripeness and delivered to local markets within hours rather than weeks, dramatically reducing spoilage, refrigeration costs, and transit emissions. Moreover, because indoor facilities are hermetically sealed from atmospheric weather extremes and pests, crops can be cultivated continuously year-round without the application of chemical herbicides or insecticides.</p><p><strong>Paragraph F:</strong> Despite these compelling advantages, vertical farming faces formidable economic hurdles. The capital expenditure required to install automated climate systems, LED lighting matrices, and sensor arrays remains prohibitive. Critics also note that powering indoor grow lights with fossil-fuel electricity merely shifts the environmental burden from land degradation to grid greenhouse gas emissions. Until renewable energy becomes universal and hardware costs decline, urban vertical farms will likely remain focused on high-margin specialty crops, serving as an indispensable supplement to, rather than a total replacement for, regenerative rural agriculture.</p>",
      "questions": [
        {
          "questionNumber": 14,
          "category": "MATCHING_HEADINGS",
          "promptText": "Choose the correct heading for Paragraph A.",
          "options": [
            "i. Spatial optimization in indoor environments",
            "ii. Eliminating food miles through localized harvesting",
            "iii. High capital barriers and energy concerns",
            "iv. Spectral advancements in artificial lighting",
            "v. The ecological toll of traditional farming",
            "vi. Water conservation through closed-loop systems"
          ],
          "correctAnswers": ["v"],
          "explanation": "Paragraph A focuses on conventional farming's environmental destruction: freshwater depletion, deforestation, soil degradation, and carbon footprints."
        },
        {
          "questionNumber": 15,
          "category": "MATCHING_HEADINGS",
          "promptText": "Choose the correct heading for Paragraph B.",
          "options": [
            "i. Spatial optimization in indoor environments",
            "ii. Eliminating food miles through localized harvesting",
            "iii. High capital barriers and energy concerns",
            "iv. Spectral advancements in artificial lighting",
            "v. The ecological toll of traditional farming",
            "vi. Water conservation through closed-loop systems"
          ],
          "correctAnswers": ["i"],
          "explanation": "Paragraph B explains how vertical farms utilize vertical architecture in warehouses to yield huge output on tiny spatial footprints."
        },
        {
          "questionNumber": 16,
          "category": "MATCHING_HEADINGS",
          "promptText": "Choose the correct heading for Paragraph C.",
          "options": [
            "i. Spatial optimization in indoor environments",
            "ii. Eliminating food miles through localized harvesting",
            "iii. High capital barriers and energy concerns",
            "iv. Spectral advancements in artificial lighting",
            "v. The ecological toll of traditional farming",
            "vi. Water conservation through closed-loop systems"
          ],
          "correctAnswers": ["vi"],
          "explanation": "Paragraph C describes closed-loop hydroponic and aeroponic systems that save up to 95% of water."
        },
        {
          "questionNumber": 17,
          "category": "MATCHING_HEADINGS",
          "promptText": "Choose the correct heading for Paragraph D.",
          "options": [
            "i. Spatial optimization in indoor environments",
            "ii. Eliminating food miles through localized harvesting",
            "iii. High capital barriers and energy concerns",
            "iv. Spectral advancements in artificial lighting",
            "v. The ecological toll of traditional farming",
            "vi. Water conservation through closed-loop systems"
          ],
          "correctAnswers": ["iv"],
          "explanation": "Paragraph D covers hyper-efficient solid-state LEDs emitting tailored red and blue spectral wavelengths."
        },
        {
          "questionNumber": 18,
          "category": "MATCHING_HEADINGS",
          "promptText": "Choose the correct heading for Paragraph E.",
          "options": [
            "i. Spatial optimization in indoor environments",
            "ii. Eliminating food miles through localized harvesting",
            "iii. High capital barriers and energy concerns",
            "iv. Spectral advancements in artificial lighting",
            "v. The ecological toll of traditional farming",
            "vi. Water conservation through closed-loop systems"
          ],
          "correctAnswers": ["ii"],
          "explanation": "Paragraph E details eliminating 'food miles', reducing transport emissions, and delivering freshly harvested produce locally."
        },
        {
          "questionNumber": 19,
          "category": "MATCHING_HEADINGS",
          "promptText": "Choose the correct heading for Paragraph F.",
          "options": [
            "i. Spatial optimization in indoor environments",
            "ii. Eliminating food miles through localized harvesting",
            "iii. High capital barriers and energy concerns",
            "iv. Spectral advancements in artificial lighting",
            "v. The ecological toll of traditional farming",
            "vi. Water conservation through closed-loop systems"
          ],
          "correctAnswers": ["iii"],
          "explanation": "Paragraph F covers economic obstacles, capital expenditures, and electrical grid consumption."
        },
        {
          "questionNumber": 20,
          "category": "MCQ_SINGLE",
          "promptText": "What percentage of global freshwater withdrawals is consumed by traditional open-field farming?",
          "options": [
            "A. Approximately thirty percent",
            "B. Nearly fifty percent",
            "C. Nearly seventy percent",
            "D. More than ninety percent"
          ],
          "correctAnswers": ["C"],
          "explanation": "Paragraph A states: 'Conventional open-field agriculture currently accounts for nearly seventy percent of all freshwater withdrawals globally.'"
        },
        {
          "questionNumber": 21,
          "category": "MCQ_SINGLE",
          "promptText": "How do aeroponic systems deliver nutrients to plant roots?",
          "options": [
            "A. By submerging roots continuously in still mineral pools",
            "B. By intermittent misting with a nutrient-rich aerosol",
            "C. Through decomposing organic topsoil fertilizers",
            "D. Via capillary action through synthetic volcanic sponges"
          ],
          "correctAnswers": ["B"],
          "explanation": "Paragraph C states aeroponics operates by 'suspending root structures in mid-air and misting them intermittently with a nutrient aerosol.'"
        },
        {
          "questionNumber": 22,
          "category": "MCQ_SINGLE",
          "promptText": "Modern horticultural LED fixtures primarily emit which wavelengths of light to stimulate growth?",
          "options": [
            "A. Infrared and ultraviolet",
            "B. Green and amber",
            "C. Red and blue",
            "D. Full-spectrum white exclusively"
          ],
          "correctAnswers": ["C"],
          "explanation": "Paragraph D states LEDs deliver 'specifically optimized red and blue wavelengths—that accelerate photosynthesis'."
        },
        {
          "questionNumber": 23,
          "category": "MCQ_SINGLE",
          "promptText": "The term 'food miles' directly relates to:",
          "options": [
            "A. The fuel efficiency of tractors on rural farms",
            "B. The distance food travels from harvest site to the consumer",
            "C. The area of land needed to feed one urban resident",
            "D. The maximum delivery radius of electric delivery vans"
          ],
          "correctAnswers": ["B"],
          "explanation": "Paragraph E refers to food miles in the context of transport distance from harvest to table."
        },
        {
          "questionNumber": 24,
          "category": "MCQ_SINGLE",
          "promptText": "Why do vertical farms avoid chemical pesticides and herbicides?",
          "options": [
            "A. Government regulations forbid chemical use in all city centers",
            "B. Indoor environments are hermetically sealed against exterior pests and weeds",
            "C. Plant roots are inherently immune to fungal pathogens in water",
            "D. Artificial grow lights destroy all bacterial organisms"
          ],
          "correctAnswers": ["B"],
          "explanation": "Paragraph E states: 'because indoor facilities are hermetically sealed from atmospheric weather extremes and pests, crops can be cultivated continuously year-round without the application of chemical herbicides or insecticides.'"
        },
        {
          "questionNumber": 25,
          "category": "MCQ_SINGLE",
          "promptText": "What is the primary ecological criticism leveled against current indoor vertical farming?",
          "options": [
            "A. High electrical demand for lighting and climate controls if powered by fossil fuels",
            "B. Excessive disposal of single-use plastic hydroponic tubing",
            "C. Inability of human laborers to work in high-humidity indoor zones",
            "D. Contamination of municipal water tables from concentrated mineral runoff"
          ],
          "correctAnswers": ["A"],
          "explanation": "Paragraph F notes: 'Critics also note that powering indoor grow lights with fossil-fuel electricity merely shifts the environmental burden from land degradation to grid greenhouse gas emissions.'"
        },
        {
          "questionNumber": 26,
          "category": "MCQ_SINGLE",
          "promptText": "According to the passage, vertical farming in the near future will most likely:",
          "options": [
            "A. Replace all rural grain and cereal cultivation",
            "B. Collapse entirely due to escalating global energy prices",
            "C. Serve as a vital complement to sustainable rural agriculture",
            "D. Be restricted strictly to research institutions"
          ],
          "correctAnswers": ["C"],
          "explanation": "Paragraph F concludes that vertical farms will serve as 'an indispensable supplement to, rather than a total replacement for, regenerative rural agriculture.'"
        }
      ]
    },
    {
      "sectionNumber": 3,
      "title": "Section 3: Neuroplasticity and Language Learning",
      "passageHtml": "<p>Throughout much of the twentieth century, conventional neuroscience operated under the deterministic belief that the adult human brain was structurally immutable. It was widely accepted that after a burst of development during early childhood, the brain's neural architecture solidified like dried concrete, with neurons progressively degenerating with age. Any severe cognitive deficit or language loss incurred in adulthood was considered permanent. However, groundbreaking discoveries in functional neuroimaging have shattered this static paradigm, revealing an extraordinary lifelong characteristic known as neuroplasticity—the brain's capacity to reorganize its neural pathways and forge new synaptic connections throughout adult life.</p><p>Nowhere is adult neuroplasticity more vividly demonstrated than in the acquisition of a second language. For decades, linguist Eric Lenneberg's Critical Period Hypothesis posited that fluent language acquisition was biologically tethered to childhood, closing abruptly at puberty when cerebral lateralization was thought to become fixed. Recent volumetric magnetic resonance imaging (MRI) studies have overturned this pessimistic prognosis. When adult learners undergo intensive second-language training, measurable structural changes occur within weeks. Grey matter density increases markedly in the left inferior parietal cortex, an area governing phonological processing and vocabulary acquisition, while the hippocampus exhibits accelerated neurogenesis.</p><p>Furthermore, acquiring an additional language profoundly enhances the structural integrity of white matter tracts. White matter consists of millions of myelin-insulated nerve fibers that transmit electrical signals between distant brain regions. Studies led by neuroscientist Dr. Ellen Bialystok demonstrate that bilingual individuals maintain thicker myelin sheaths along the corpus callosum—the broad band of nerve fibers connecting the left and right hemispheres. This bilateral coordination allows bilinguals to rapidly switch between distinct linguistic systems, conferring cognitive resilience that delays the clinical symptoms of dementia and Alzheimer's disease by an average of four to five years compared to monolinguals.</p><p>Nevertheless, adult language learners do encounter neurobiological differences compared to child learners. Children primarily absorb language implicitly through procedural memory, effortless immersion, and acoustic mimicry. In contrast, adult brains rely predominantly on declarative memory systems governed by the prefrontal cortex, utilizing analytical frameworks, explicit grammar rules, and conscious cognitive strategies. While adult learners may occasionally struggle with native phonemic pronunciation due to perceptual narrowing developed in infancy, their mature executive control network allows them to grasp complex syntactic and semantic concepts with greater rapid analytical precision than children.</p><p>In summary, the brain is not a static machine, but an adaptable muscle that remodels itself in direct response to rigorous mental exercise. Far from being a biological impossibility, learning a foreign language in adulthood constitutes one of the most potent cognitive workouts known to medical science, building cognitive reserve and preserving neural elasticity across the entire human lifespan.</p>",
      "questions": [
        {
          "questionNumber": 27,
          "category": "TFNG",
          "promptText": "Twentieth-century neuroscientists believed that the adult brain could readily regenerate damaged neuronal circuits.",
          "correctAnswers": ["FALSE", "F"],
          "explanation": "Paragraph 1 states scientists operated under the belief that the brain was structurally immutable and solidified like dried concrete."
        },
        {
          "questionNumber": 28,
          "category": "TFNG",
          "promptText": "Intensive language training in adults can produce detectable structural brain modifications within weeks.",
          "correctAnswers": ["TRUE", "T"],
          "explanation": "Paragraph 2 states: 'When adult learners undergo intensive second-language training, measurable structural changes occur within weeks.'"
        },
        {
          "questionNumber": 29,
          "category": "TFNG",
          "promptText": "Grey matter density decreases in the inferior parietal cortex as adults learn vocabulary.",
          "correctAnswers": ["FALSE", "F"],
          "explanation": "Paragraph 2 states: 'Grey matter density increases markedly in the left inferior parietal cortex.'"
        },
        {
          "questionNumber": 30,
          "category": "TFNG",
          "promptText": "Dr. Ellen Bialystok conducted clinical trials on language learning in pediatric stroke patients.",
          "correctAnswers": ["NOT GIVEN", "NG"],
          "explanation": "The text mentions Dr. Bialystok's research on bilinguals and white matter, but pediatric stroke patients are never mentioned."
        },
        {
          "questionNumber": 31,
          "category": "TFNG",
          "promptText": "Bilingualism has been linked to delaying the onset of Alzheimer's symptoms by several years.",
          "correctAnswers": ["TRUE", "T"],
          "explanation": "Paragraph 3 explicitly affirms: 'delays the clinical symptoms of dementia and Alzheimer's disease by an average of four to five years compared to monolinguals.'"
        },
        {
          "questionNumber": 32,
          "category": "TFNG",
          "promptText": "Child language acquisition relies more heavily on declarative memory than adult learning does.",
          "correctAnswers": ["FALSE", "F"],
          "explanation": "Paragraph 4 explains that children rely on procedural memory, whereas adults rely predominantly on declarative memory systems."
        },
        {
          "questionNumber": 33,
          "category": "MCQ_SINGLE",
          "promptText": "The Critical Period Hypothesis originally maintained that:",
          "options": [
            "A. Adult brains produce more myelin than adolescent brains",
            "B. Fluent language learning was strictly limited to childhood before puberty",
            "C. Second-language vocabulary is permanently stored in the right hemisphere",
            "D. Language acquisition requires at least six hours of daily auditory immersion"
          ],
          "correctAnswers": ["B"],
          "explanation": "Paragraph 2 explains the hypothesis 'posited that fluent language acquisition was biologically tethered to childhood, closing abruptly at puberty'."
        },
        {
          "questionNumber": 34,
          "category": "MCQ_SINGLE",
          "promptText": "What function does the corpus callosum serve in the human brain?",
          "options": [
            "A. It isolates phonological processing from long-term memory",
            "B. It generates neural cells inside the hippocampus",
            "C. It connects and coordinates communication between the left and right hemispheres",
            "D. It restricts procedural memory recall during speech production"
          ],
          "correctAnswers": ["C"],
          "explanation": "Paragraph 3 defines the corpus callosum as 'the broad band of nerve fibers connecting the left and right hemispheres'."
        },
        {
          "questionNumber": 35,
          "category": "MCQ_SINGLE",
          "promptText": "Why do adult language learners typically struggle more with native-like pronunciation?",
          "options": [
            "A. Decreased physical flexibility in adult vocal cords",
            "B. Perceptual narrowing established during infancy",
            "C. Total deterioration of the prefrontal cortex",
            "D. Inability to access procedural memory systems"
          ],
          "correctAnswers": ["B"],
          "explanation": "Paragraph 4 notes: 'While adult learners may occasionally struggle with native phonemic pronunciation due to perceptual narrowing developed in infancy...'"
        },
        {
          "questionNumber": 36,
          "category": "MCQ_SINGLE",
          "promptText": "Which advantage do adult learners exhibit over children when acquiring a language?",
          "options": [
            "A. Effortless unconscious procedural mimicry",
            "B. Faster instinctive accent acquisition",
            "C. Mature executive control and analytical comprehension of grammar",
            "D. Immunity to mental fatigue during long lessons"
          ],
          "correctAnswers": ["C"],
          "explanation": "Paragraph 4 states their 'mature executive control network allows them to grasp complex syntactic and semantic concepts with greater rapid analytical precision than children.'"
        },
        {
          "questionNumber": 37,
          "category": "SUMMARY_COMPLETION",
          "promptText": "For many decades, scientists adhered to the dogma that cerebral architecture was fixed after [childhood].",
          "correctAnswers": ["childhood", "puberty"],
          "explanation": "Paragraph 1 and 2 mention the belief that neural architecture solidified after early childhood."
        },
        {
          "questionNumber": 38,
          "category": "SUMMARY_COMPLETION",
          "promptText": "However, breakthroughs in neuroimaging proved that the adult brain creates new [synaptic] connections in response to rigorous cognitive effort.",
          "correctAnswers": ["synaptic", "neural"],
          "explanation": "Paragraph 1 highlights the brain's ability to 'reorganize its neural pathways and forge new synaptic connections'."
        },
        {
          "questionNumber": 39,
          "category": "SUMMARY_COMPLETION",
          "promptText": "Mastering complex grammatical frameworks provides continuous exercise for the brain's [executive] control network.",
          "correctAnswers": ["executive"],
          "explanation": "Paragraph 4 highlights that adults utilize their 'mature executive control network'."
        },
        {
          "questionNumber": 40,
          "category": "SUMMARY_COMPLETION",
          "promptText": "Consequently, bilingualism acts as a powerful buffer that builds cognitive [reserve] against age-related degeneration.",
          "correctAnswers": ["reserve"],
          "explanation": "Paragraph 5 concludes that second language learning builds 'cognitive reserve and preserving neural elasticity'."
        }
      ]
    }
  ]
}
$_JSON_$,
  $_JSON_${
    "1": { "category": "TFNG", "correctAnswers": ["TRUE", "T"] },
    "2": { "category": "TFNG", "correctAnswers": ["FALSE", "F"] },
    "3": { "category": "TFNG", "correctAnswers": ["TRUE", "T"] },
    "4": { "category": "TFNG", "correctAnswers": ["FALSE", "F"] },
    "5": { "category": "TFNG", "correctAnswers": ["TRUE", "T"] },
    "6": { "category": "TFNG", "correctAnswers": ["NOT GIVEN", "NG"] },
    "7": { "category": "TFNG", "correctAnswers": ["TRUE", "T"] },
    "8": { "category": "FILL_BLANKS", "correctAnswers": ["cornmeal", "maize"] },
    "9": { "category": "FILL_BLANKS", "correctAnswers": ["royal court", "aristocracy"] },
    "10": { "category": "FILL_BLANKS", "correctAnswers": ["fat", "cocoa butter"] },
    "11": { "category": "FILL_BLANKS", "correctAnswers": ["bar", "chocolate bar"] },
    "12": { "category": "FILL_BLANKS", "correctAnswers": ["conching"] },
    "13": { "category": "FILL_BLANKS", "correctAnswers": ["Africa"] },
    "14": { "category": "MATCHING_HEADINGS", "correctAnswers": ["v"] },
    "15": { "category": "MATCHING_HEADINGS", "correctAnswers": ["i"] },
    "16": { "category": "MATCHING_HEADINGS", "correctAnswers": ["vi"] },
    "17": { "category": "MATCHING_HEADINGS", "correctAnswers": ["iv"] },
    "18": { "category": "MATCHING_HEADINGS", "correctAnswers": ["ii"] },
    "19": { "category": "MATCHING_HEADINGS", "correctAnswers": ["iii"] },
    "20": { "category": "MCQ_SINGLE", "correctAnswers": ["C"] },
    "21": { "category": "MCQ_SINGLE", "correctAnswers": ["B"] },
    "22": { "category": "MCQ_SINGLE", "correctAnswers": ["C"] },
    "23": { "category": "MCQ_SINGLE", "correctAnswers": ["B"] },
    "24": { "category": "MCQ_SINGLE", "correctAnswers": ["B"] },
    "25": { "category": "MCQ_SINGLE", "correctAnswers": ["A"] },
    "26": { "category": "MCQ_SINGLE", "correctAnswers": ["C"] },
    "27": { "category": "TFNG", "correctAnswers": ["FALSE", "F"] },
    "28": { "category": "TFNG", "correctAnswers": ["TRUE", "T"] },
    "29": { "category": "TFNG", "correctAnswers": ["FALSE", "F"] },
    "30": { "category": "TFNG", "correctAnswers": ["NOT GIVEN", "NG"] },
    "31": { "category": "TFNG", "correctAnswers": ["TRUE", "T"] },
    "32": { "category": "TFNG", "correctAnswers": ["FALSE", "F"] },
    "33": { "category": "MCQ_SINGLE", "correctAnswers": ["B"] },
    "34": { "category": "MCQ_SINGLE", "correctAnswers": ["C"] },
    "35": { "category": "MCQ_SINGLE", "correctAnswers": ["B"] },
    "36": { "category": "MCQ_SINGLE", "correctAnswers": ["C"] },
    "37": { "category": "SUMMARY_COMPLETION", "correctAnswers": ["childhood", "puberty"] },
    "38": { "category": "SUMMARY_COMPLETION", "correctAnswers": ["synaptic", "neural"] },
    "39": { "category": "SUMMARY_COMPLETION", "correctAnswers": ["executive"] },
    "40": { "category": "SUMMARY_COMPLETION", "correctAnswers": ["reserve"] }
  }
$_JSON_$
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content_json = EXCLUDED.content_json,
  answer_key_json = EXCLUDED.answer_key_json;


-- -------------------------------------------------------------------------
-- B) Academic Writing Mock Test 1 (Full Mock, Free, Task 1 & Task 2)
-- -------------------------------------------------------------------------
INSERT INTO public.tests (
  id,
  title,
  test_category,
  module_type,
  is_premium,
  content_json,
  answer_key_json
)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'Academic Writing Mock Test 1',
  'full_mock',
  'writing',
  false,
  $_JSON_${
  "tasks": [
    {
      "taskNumber": 1,
      "type": "bar_chart",
      "promptText": "The bar chart below shows the percentage of households with access to the internet in five countries in 2005 and 2015. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
      "imageDescription": "Bar chart: USA (60%→85%), UK (55%→90%), Japan (65%→93%), Brazil (20%→58%), Nigeria (5%→35%)"
    },
    {
      "taskNumber": 2,
      "type": "essay",
      "promptText": "Some people believe that universities should focus on providing academic skills and theoretical knowledge, while others think they should prepare students for employment. Discuss both views and give your own opinion. Write at least 250 words."
    }
  ]
}
$_JSON_$,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content_json = EXCLUDED.content_json;


-- -------------------------------------------------------------------------
-- C) Cambridge 18 Test 1 Reading Companion (Answer Key Grader)
-- -------------------------------------------------------------------------
INSERT INTO public.tests (
  id,
  title,
  test_category,
  module_type,
  is_premium,
  content_json,
  answer_key_json
)
VALUES (
  'c3333333-3333-3333-3333-333333333333',
  'Cambridge 18 - Test 1 Reading',
  'cambridge_companion',
  'reading',
  false,
  $_JSON_${
  "sections": [
    {
      "sectionNumber": 1,
      "title": "Passage 1: Urban Transportation and Cycling Schemes",
      "questions": [
        { "questionNumber": 1, "category": "TFNG", "promptText": "Question 1", "correctAnswers": ["TRUE", "T"], "explanation": "Confirmed in Paragraph 1." },
        { "questionNumber": 2, "category": "TFNG", "promptText": "Question 2", "correctAnswers": ["FALSE", "F"], "explanation": "Contradicted in Paragraph 2." },
        { "questionNumber": 3, "category": "TFNG", "promptText": "Question 3", "correctAnswers": ["NOT GIVEN", "NG"], "explanation": "Not mentioned in the text." },
        { "questionNumber": 4, "category": "TFNG", "promptText": "Question 4", "correctAnswers": ["TRUE", "T"], "explanation": "Directly supported in Paragraph 3." },
        { "questionNumber": 5, "category": "TFNG", "promptText": "Question 5", "correctAnswers": ["FALSE", "F"], "explanation": "Opposite claim stated in Paragraph 4." },
        { "questionNumber": 6, "category": "FILL_BLANKS", "promptText": "Question 6", "correctAnswers": ["helmets"], "explanation": "Found in Section 1 note completion." },
        { "questionNumber": 7, "category": "FILL_BLANKS", "promptText": "Question 7", "correctAnswers": ["subsidies", "subsidy"], "explanation": "Found in Section 1 note completion." },
        { "questionNumber": 8, "category": "FILL_BLANKS", "promptText": "Question 8", "correctAnswers": ["docking stations", "stations"], "explanation": "Found in Section 1 note completion." },
        { "questionNumber": 9, "category": "FILL_BLANKS", "promptText": "Question 9", "correctAnswers": ["maintenance"], "explanation": "Found in Section 1 note completion." },
        { "questionNumber": 10, "category": "FILL_BLANKS", "promptText": "Question 10", "correctAnswers": ["congestion"], "explanation": "Found in Section 1 note completion." },
        { "questionNumber": 11, "category": "FILL_BLANKS", "promptText": "Question 11", "correctAnswers": ["membership"], "explanation": "Found in Section 1 note completion." },
        { "questionNumber": 12, "category": "FILL_BLANKS", "promptText": "Question 12", "correctAnswers": ["vandalism"], "explanation": "Found in Section 1 note completion." },
        { "questionNumber": 13, "category": "FILL_BLANKS", "promptText": "Question 13", "correctAnswers": ["revenue"], "explanation": "Found in Section 1 note completion." }
      ]
    },
    {
      "sectionNumber": 2,
      "title": "Passage 2: The Ecology of Forest Canopies",
      "questions": [
        { "questionNumber": 14, "category": "MATCHING_HEADINGS", "promptText": "Question 14", "correctAnswers": ["iv"], "explanation": "Matches heading iv." },
        { "questionNumber": 15, "category": "MATCHING_HEADINGS", "promptText": "Question 15", "correctAnswers": ["vii"], "explanation": "Matches heading vii." },
        { "questionNumber": 16, "category": "MATCHING_HEADINGS", "promptText": "Question 16", "correctAnswers": ["ii"], "explanation": "Matches heading ii." },
        { "questionNumber": 17, "category": "MATCHING_HEADINGS", "promptText": "Question 17", "correctAnswers": ["v"], "explanation": "Matches heading v." },
        { "questionNumber": 18, "category": "MATCHING_HEADINGS", "promptText": "Question 18", "correctAnswers": ["i"], "explanation": "Matches heading i." },
        { "questionNumber": 19, "category": "MATCHING_HEADINGS", "promptText": "Question 19", "correctAnswers": ["viii"], "explanation": "Matches heading viii." },
        { "questionNumber": 20, "category": "MCQ_SINGLE", "promptText": "Question 20", "correctAnswers": ["B"], "explanation": "Option B is correct." },
        { "questionNumber": 21, "category": "MCQ_SINGLE", "promptText": "Question 21", "correctAnswers": ["D"], "explanation": "Option D is correct." },
        { "questionNumber": 22, "category": "MCQ_SINGLE", "promptText": "Question 22", "correctAnswers": ["A"], "explanation": "Option A is correct." },
        { "questionNumber": 23, "category": "MCQ_SINGLE", "promptText": "Question 23", "correctAnswers": ["C"], "explanation": "Option C is correct." },
        { "questionNumber": 24, "category": "MCQ_SINGLE", "promptText": "Question 24", "correctAnswers": ["A"], "explanation": "Option A is correct." },
        { "questionNumber": 25, "category": "FILL_BLANKS", "promptText": "Question 25", "correctAnswers": ["epiphytes"], "explanation": "Found in canopy classification." },
        { "questionNumber": 26, "category": "FILL_BLANKS", "promptText": "Question 26", "correctAnswers": ["bromeliads"], "explanation": "Found in microhabitat summary." }
      ]
    },
    {
      "sectionNumber": 3,
      "title": "Passage 3: Artificial Intelligence and Human Creativity",
      "questions": [
        { "questionNumber": 27, "category": "YNNG", "promptText": "Question 27", "correctAnswers": ["YES", "Y"], "explanation": "Agrees with writer claims in Paragraph 1." },
        { "questionNumber": 28, "category": "YNNG", "promptText": "Question 28", "correctAnswers": ["NO", "N"], "explanation": "Contradicts writer claims in Paragraph 2." },
        { "questionNumber": 29, "category": "YNNG", "promptText": "Question 29", "correctAnswers": ["NOT GIVEN", "NG"], "explanation": "Writer does not take a stance on this point." },
        { "questionNumber": 30, "category": "YNNG", "promptText": "Question 30", "correctAnswers": ["YES", "Y"], "explanation": "Directly supports claim in Paragraph 3." },
        { "questionNumber": 31, "category": "MCQ_SINGLE", "promptText": "Question 31", "correctAnswers": ["C"], "explanation": "Option C is correct." },
        { "questionNumber": 32, "category": "MCQ_SINGLE", "promptText": "Question 32", "correctAnswers": ["B"], "explanation": "Option B is correct." },
        { "questionNumber": 33, "category": "MCQ_SINGLE", "promptText": "Question 33", "correctAnswers": ["D"], "explanation": "Option D is correct." },
        { "questionNumber": 34, "category": "MCQ_SINGLE", "promptText": "Question 34", "correctAnswers": ["A"], "explanation": "Option A is correct." },
        { "questionNumber": 35, "category": "MCQ_SINGLE", "promptText": "Question 35", "correctAnswers": ["C"], "explanation": "Option C is correct." },
        { "questionNumber": 36, "category": "SUMMARY_COMPLETION", "promptText": "Question 36", "correctAnswers": ["algorithms"], "explanation": "Found in computational synthesis summary." },
        { "questionNumber": 37, "category": "SUMMARY_COMPLETION", "promptText": "Question 37", "correctAnswers": ["heuristics"], "explanation": "Found in cognitive decision framework." },
        { "questionNumber": 38, "category": "SUMMARY_COMPLETION", "promptText": "Question 38", "correctAnswers": ["serendipity"], "explanation": "Found in creative emergence section." },
        { "questionNumber": 39, "category": "SUMMARY_COMPLETION", "promptText": "Question 39", "correctAnswers": ["authenticity"], "explanation": "Found in artistic evaluation criteria." },
        { "questionNumber": 40, "category": "SUMMARY_COMPLETION", "promptText": "Question 40", "correctAnswers": ["symbiosis"], "explanation": "Concludes human-machine collaboration." }
      ]
    }
  ]
}
$_JSON_$,
  $_JSON_${
    "1": { "category": "TFNG", "correctAnswers": ["TRUE", "T"] },
    "2": { "category": "TFNG", "correctAnswers": ["FALSE", "F"] },
    "3": { "category": "TFNG", "correctAnswers": ["NOT GIVEN", "NG"] },
    "4": { "category": "TFNG", "correctAnswers": ["TRUE", "T"] },
    "5": { "category": "TFNG", "correctAnswers": ["FALSE", "F"] },
    "6": { "category": "FILL_BLANKS", "correctAnswers": ["helmets"] },
    "7": { "category": "FILL_BLANKS", "correctAnswers": ["subsidies", "subsidy"] },
    "8": { "category": "FILL_BLANKS", "correctAnswers": ["docking stations", "stations"] },
    "9": { "category": "FILL_BLANKS", "correctAnswers": ["maintenance"] },
    "10": { "category": "FILL_BLANKS", "correctAnswers": ["congestion"] },
    "11": { "category": "FILL_BLANKS", "correctAnswers": ["membership"] },
    "12": { "category": "FILL_BLANKS", "correctAnswers": ["vandalism"] },
    "13": { "category": "FILL_BLANKS", "correctAnswers": ["revenue"] },
    "14": { "category": "MATCHING_HEADINGS", "correctAnswers": ["iv"] },
    "15": { "category": "MATCHING_HEADINGS", "correctAnswers": ["vii"] },
    "16": { "category": "MATCHING_HEADINGS", "correctAnswers": ["ii"] },
    "17": { "category": "MATCHING_HEADINGS", "correctAnswers": ["v"] },
    "18": { "category": "MATCHING_HEADINGS", "correctAnswers": ["i"] },
    "19": { "category": "MATCHING_HEADINGS", "correctAnswers": ["viii"] },
    "20": { "category": "MCQ_SINGLE", "correctAnswers": ["B"] },
    "21": { "category": "MCQ_SINGLE", "correctAnswers": ["D"] },
    "22": { "category": "MCQ_SINGLE", "correctAnswers": ["A"] },
    "23": { "category": "MCQ_SINGLE", "correctAnswers": ["C"] },
    "24": { "category": "MCQ_SINGLE", "correctAnswers": ["A"] },
    "25": { "category": "FILL_BLANKS", "correctAnswers": ["epiphytes"] },
    "26": { "category": "FILL_BLANKS", "correctAnswers": ["bromeliads"] },
    "27": { "category": "YNNG", "correctAnswers": ["YES", "Y"] },
    "28": { "category": "YNNG", "correctAnswers": ["NO", "N"] },
    "29": { "category": "YNNG", "correctAnswers": ["NOT GIVEN", "NG"] },
    "30": { "category": "YNNG", "correctAnswers": ["YES", "Y"] },
    "31": { "category": "MCQ_SINGLE", "correctAnswers": ["C"] },
    "32": { "category": "MCQ_SINGLE", "correctAnswers": ["B"] },
    "33": { "category": "MCQ_SINGLE", "correctAnswers": ["D"] },
    "34": { "category": "MCQ_SINGLE", "correctAnswers": ["A"] },
    "35": { "category": "MCQ_SINGLE", "correctAnswers": ["C"] },
    "36": { "category": "SUMMARY_COMPLETION", "correctAnswers": ["algorithms"] },
    "37": { "category": "SUMMARY_COMPLETION", "correctAnswers": ["heuristics"] },
    "38": { "category": "SUMMARY_COMPLETION", "correctAnswers": ["serendipity"] },
    "39": { "category": "SUMMARY_COMPLETION", "correctAnswers": ["authenticity"] },
    "40": { "category": "SUMMARY_COMPLETION", "correctAnswers": ["symbiosis"] }
  }
$_JSON_$
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content_json = EXCLUDED.content_json,
  answer_key_json = EXCLUDED.answer_key_json;
