package com.edusim.config;

import com.edusim.entity.Experiment;
import com.edusim.entity.Subject;
import com.edusim.entity.User;
import com.edusim.entity.Role;
import com.edusim.entity.VivaQuestion;
import com.edusim.repository.ExperimentRepository;
import com.edusim.repository.UserRepository;
import com.edusim.repository.VivaQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.JdbcTemplate;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ExperimentRepository experimentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final VivaQuestionRepository vivaQuestionRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        // Alter legacy columns in lab_tests table to be nullable
        try {
            jdbcTemplate.execute("ALTER TABLE lab_tests MODIFY COLUMN date DATE NULL");
            jdbcTemplate.execute("ALTER TABLE lab_tests MODIFY COLUMN start_time TIME NULL");
            jdbcTemplate.execute("ALTER TABLE lab_tests MODIFY COLUMN end_time TIME NULL");
            System.out.println("[DataInitializer] Successfully altered legacy columns in lab_tests table to be nullable.");
        } catch (Exception e) {
            System.out.println("[DataInitializer] Could not alter legacy columns (they might already be altered or don't exist): " + e.getMessage());
        }

        // Seed Admin User if not exists
        if (userRepository.findByEmail("admin@edusim.com").isEmpty()) {
            User admin = new User();
            admin.setFullName("System Admin");
            admin.setEmail("admin@edusim.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        }

        if (experimentRepository.count() == 0) {
            createExperiment(
                    "Simple Pendulum",
                    Subject.PHYSICS,
                    "Study oscillatory motion using a pendulum.",
                    "BEGINNER",
                    15
            );

            createExperiment(
                    "Ohm's Law",
                    Subject.PHYSICS,
                    "Verify relationship between voltage and current.",
                    "BEGINNER",
                    20
            );

            createExperiment(
                    "Projectile Motion",
                    Subject.PHYSICS,
                    "Analyze motion of a projectile.",
                    "INTERMEDIATE",
                    25
            );

            createExperiment(
                    "Acid-Base Titration",
                    Subject.CHEMISTRY,
                    "Determine concentration using titration.",
                    "INTERMEDIATE",
                    25
            );

            createExperiment(
                    "Electrolysis of Water",
                    Subject.CHEMISTRY,
                    "Observe decomposition of water.",
                    "INTERMEDIATE",
                    20
            );

            createExperiment(
                    "pH Measurement",
                    Subject.CHEMISTRY,
                    "Measure acidity and alkalinity.",
                    "BEGINNER",
                    15
            );

            createExperiment(
                    "Osmosis & Diffusion",
                    Subject.BIOLOGY,
                    "Study movement of molecules.",
                    "BEGINNER",
                    20
            );

            createExperiment(
                    "Cell Under Microscope",
                    Subject.BIOLOGY,
                    "Observe cellular structures.",
                    "BEGINNER",
                    15
            );

            createExperiment(
                    "Blood Grouping Test",
                    Subject.BIOLOGY,
                    "Identify blood groups virtually.",
                    "INTERMEDIATE",
                    20
            );
        }

        if (vivaQuestionRepository.count() == 0) {
            seedAllVivaQuestions();
        }
    }

    private void createExperiment(
            String name,
            Subject subject,
            String description,
            String difficulty,
            Integer estimatedTime
    ) {
        Experiment experiment = new Experiment();

        experiment.setName(name);
        experiment.setSubject(subject);
        experiment.setDescription(description);
        experiment.setDifficulty(difficulty);
        experiment.setEstimatedTime(estimatedTime);

        experimentRepository.save(experiment);
    }

    private void seedAllVivaQuestions() {
        seedQuestionsForExperiment("Simple Pendulum",
            "What is a simple pendulum?",
            "State the law of mass of simple pendulum.",
            "State the law of length of simple pendulum.",
            "Explain how acceleration due to gravity (g) is verified using a simple pendulum.",
            "What is the relation between length L and time period T of a simple pendulum?",
            "Define a seconds pendulum.",
            "How does the time period of a simple pendulum change if it is taken to the Moon?",
            "Why should the angle of oscillation of a simple pendulum be kept small (less than 15 degrees)?",
            "How does air resistance affect simple pendulum motion in a real lab?",
            "What is the difference between simple harmonic motion (SHM) and periodic motion?",
            "Why do we use a spherical bob instead of a block in simple pendulum experiments?",
            "Explain the difference between length of string and effective length of the pendulum.",
            "How does temperature affect the time period of a pendulum in real environments?",
            "If the mass of the bob is doubled, what is the effect on the time period?",
            "What are the main sources of error in the simple pendulum experiment?"
        );

        seedQuestionsForExperiment("Ohm's Law",
            "State Ohm's Law and its mathematical expression.",
            "What are ohmic and non-ohmic conductors? Give examples.",
            "Define electric current and state its SI unit.",
            "What is resistance? What factors affect the resistance of a conductor?",
            "Define potential difference (voltage).",
            "What is resistivity of a material?",
            "Why is an ammeter connected in series and a voltmeter in parallel in a circuit?",
            "What happens to current if voltage is doubled while resistance is kept constant?",
            "What is the slope of a V-I graph for an ohmic conductor represent?",
            "State the precautions to be taken when performing the Ohm's Law experiment.",
            "How does temperature affect the resistance of metallic conductors?",
            "Why should the switch be turned off between taking consecutive readings?",
            "What is the purpose of a rheostat in the Ohm's Law experiment?",
            "What causes electrical resistance at the atomic level?",
            "Define electric power and its SI unit."
        );

        seedQuestionsForExperiment("Projectile Motion",
            "What is a projectile?",
            "Define trajectory of a projectile.",
            "At what angle is the range of a projectile maximum?",
            "Write the formula for the maximum height attained by a projectile.",
            "State the formula for the time of flight of a projectile.",
            "Explain why the horizontal velocity of a projectile remains constant (neglecting air resistance).",
            "What is the velocity of the projectile at its highest point?",
            "How does gravity affect vertical motion of a projectile?",
            "Explain how initial launch velocity impacts the horizontal range.",
            "What shape is the path of a projectile?",
            "What is the angle of projection for which the horizontal range and maximum height are equal?",
            "Explain the term 'range' in projectile motion.",
            "Why does launching from an elevated platform change the optimal range angle?",
            "How does air resistance alter the shape of a real trajectory?",
            "What are the horizontal and vertical components of acceleration in projectile motion?"
        );

        seedQuestionsForExperiment("Acid-Base Titration",
            "Define titration.",
            "What is the difference between equivalence point and end point?",
            "What is the role of an indicator in acid-base titration?",
            "State the chemical equation for titration of HCl with NaOH.",
            "What is phenolphthalein and what color does it turn in acidic vs basic solutions?",
            "Why is it important to swirl the conical flask during titration?",
            "Explain how to read the meniscus of a clear liquid in a burette.",
            "What is a standard solution in chemistry?",
            "What is the purpose of rinsing a burette with the titrant before starting?",
            "What is a neutralization reaction?",
            "How does pH change at the equivalence point of a strong acid-strong base titration?",
            "Define molarity and explain how it is calculated for the analyte.",
            "Why do we perform multiple titration trials?",
            "What indicator is best suited for weak acid-strong base titration?",
            "Why should air bubbles be removed from the burette tip before taking readings?"
        );

        seedQuestionsForExperiment("Electrolysis of Water",
            "What is electrolysis.",
            "Write the overall balanced chemical equation for the electrolysis of water.",
            "Which gas is released at the anode during water electrolysis?",
            "Which gas is released at the cathode during water electrolysis?",
            "Why is the volume of hydrogen gas produced double that of oxygen gas?",
            "Why is pure water a poor conductor of electricity?",
            "What is the function of adding dilute sulfuric acid or sodium hydroxide to water in this experiment?",
            "Define oxidation and reduction in the context of electrolysis.",
            "Write the half-reaction occurring at the anode.",
            "Write the half-reaction occurring at the cathode.",
            "How would you test for the presence of hydrogen gas?",
            "How would you test for the presence of oxygen gas?",
            "What is a voltameter? Mention the type used in this experiment.",
            "Why are platinum electrodes preferred for the electrolysis of water?",
            "How does increasing the voltage of the DC source affect the rate of gas evolution?"
        );

        seedQuestionsForExperiment("pH Measurement",
            "Define pH and write its mathematical equation.",
            "What makes a solution acidic, neutral, or basic on the pH scale?",
            "What is a universal indicator?",
            "Explain how a digital pH meter is calibrated.",
            "What is the pH of pure water at 25 degrees Celsius?",
            "What ion concentration determines the pH of a solution?",
            "Give examples of two household substances that are acidic and two that are basic.",
            "What is the significance of the pH scale being logarithmic?",
            "What is a buffer solution?",
            "How does temperature affect the pH reading of a solution?",
            "Why is it necessary to rinse the pH electrode with distilled water between measurements?",
            "What is the pH range of human blood?",
            "Explain why rain water is slightly acidic even in unpolluted areas.",
            "What is the color of red litmus paper when dipped in a base?",
            "What is pOH, and what is its relationship with pH at room temperature?"
        );

        seedQuestionsForExperiment("Osmosis & Diffusion",
            "Define osmosis.",
            "Define diffusion.",
            "State the difference between active transport and passive transport.",
            "Explain hypertonic, hypotonic, and isotonic solutions.",
            "What is a semi-permeable membrane? Give an example.",
            "What happens to a red blood cell when placed in a hypotonic solution?",
            "What is plasmolysis in plant cells?",
            "How does temperature affect the rate of diffusion?",
            "Why does water move across the membrane in osmosis?",
            "Explain the concept of concentration gradient.",
            "What is turgor pressure in plant cells?",
            "Name the factors that influence the rate of osmosis.",
            "How does molecular size affect the rate of diffusion through a membrane?",
            "Why is osmosis considered a special case of diffusion?",
            "What role does osmosis play in plant root water absorption?"
        );

        seedQuestionsForExperiment("Cell Under Microscope",
            "State the main differences between plant and animal cells under a microscope.",
            "What is the function of the nucleus in a cell?",
            "Why do we apply a stain (like methylene blue or iodine) to cell specimens?",
            "What is the function of the cell wall in plant cells?",
            "Why are chloroplasts visible in plant cells but absent in animal cells?",
            "What does magnification of a microscope mean?",
            "What is the purpose of the coverslip placed over a specimen?",
            "How do you adjust the focus on a microscope under high power?",
            "What are vacuoles, and how do they differ in size between plant and animal cells?",
            "Explain the role of cell membrane.",
            "Why should specimen slices be extremely thin for light microscopy?",
            "What is resolution in microscopy?",
            "What is the function of mitochondria?",
            "Why do animal cells undergo lysis in pure water while plant cells do not?",
            "What is the role of the condenser lens on a compound microscope?"
        );

        seedQuestionsForExperiment("Blood Grouping Test",
            "What is the ABO blood group system based on?",
            "What is agglutination? How is it used in blood grouping?",
            "Explain the Rh factor and its clinical significance.",
            "Which blood group is the universal donor and why?",
            "Which blood group is the universal recipient and why?",
            "What antigens and antibodies are present in a person with blood group AB?",
            "What happens if a person with blood group A receives blood group B?",
            "What are the names of the three antisera used in blood grouping tests?",
            "If agglutination is observed in wells A and D, but not B, what is the blood group?",
            "Explain the genetics of ABO blood typing.",
            "What antigens and antibodies are present in blood group O?",
            "Why does the blood grouping tile need to be gently rocked?",
            "What is erythroblastosis fetalis?",
            "Can an Rh-negative person receive Rh-positive blood? Explain.",
            "How does antiserum react with antigens to cause clumping?"
        );
    }

    private void seedQuestionsForExperiment(String expName, String... questionTexts) {
        Experiment experiment = experimentRepository.findByName(expName).orElse(null);
        if (experiment != null) {
            for (String text : questionTexts) {
                VivaQuestion q = new VivaQuestion();
                q.setExperiment(experiment);
                q.setQuestionText(text);
                vivaQuestionRepository.save(q);
            }
        }
    }
}