# Haraka.ai LLM Medical Context
# ==============================
# 
# This file contains the true medical knowledge and biomechanical rules
# that the LLM must follow when generating clinical reports.
#
# IMPORTANT: The LLM MUST NOT guess or invent biomechanical principles.
# All clinical reasoning must be grounded in these rules.
#
# Author: Physiotherapist Team
# Last Updated: 2026-05-16

---

## Biomechanical Rules for Common Exercises

### Shoulder Flexion
- **Normal Range**: 0° to 180°
- **Target for Rehabilitation**: 120°-150°
- **Warning Signs**: 
  - Trunk compensation (leaning back to increase range)
  - Scapular elevation (shrugging shoulders)
  - Asymmetric movement between left and right sides

### Shoulder Abduction
- **Normal Range**: 0° to 180°
- **Target for Rehabilitation**: 90°-120°
- **Warning Signs**:
  - Trunk lateral flexion (leaning sideways)
  - Scapular winging
  - Excessive elevation beyond 90° without proper scapular rotation

### Elbow Flexion/Extension
- **Normal Range**: 0° (full extension) to 150° (full flexion)
- **Target for Rehabilitation**: Full extension to 130° flexion
- **Warning Signs**:
  - Shoulder compensation (using shoulder to lift arm)
  - Wrist deviation
  - Asymmetric speed between flexion and extension

### Hip Flexion
- **Normal Range**: 0° to 120°
- **Target for Rehabilitation**: 90°-110°
- **Warning Signs**:
  - Lumbar lordosis (arching lower back)
  - Pelvic tilt
  - Knee hyperextension

### Knee Extension
- **Normal Range**: 0° (full extension) to 135° (full flexion)
- **Target for Rehabilitation**: Full extension to 120° flexion
- **Warning Signs**:
  - Hip hiking
  - Excessive lateral movement
  - Quadriceps lag (inability to achieve full extension)

---

## Pain Assessment Guidelines

### Wong-Baker FACES Pain Scale
- **0 (No Hurt)**: Patient reports no pain
- **1 (Hurts Little Bit)**: Mild pain, does not interfere with activity
- **2 (Hurts Little More)**: Moderate pain, may slightly limit activity
- **3 (Hurts Even More)**: Significant pain, interferes with activity
- **4 (Hurts Whole Lot)**: Severe pain, significantly limits activity
- **5 (Hurts Worst)**: Worst possible pain, unable to continue

### Pain Red Flags
- Pain score ≥ 4 during exercise
- Sharp or shooting pain (vs. dull/aching)
- Pain that persists after exercise ends
- Pain in locations not related to target muscle group

---

## Repetition Quality Assessment

### Good Repetition Criteria
- Controlled movement speed (not too fast or jerky)
- Full range of motion achieved
- No compensatory movements
- Symmetrical left/right movement
- Consistent angle measurements across reps

### Poor Repetition Indicators
- Trunk shift or compensation
- Asymmetric movement patterns
- Incomplete range of motion
- Excessive speed (> 90°/second for most exercises)
- High variance in angle measurements

---

## Clinical Report Structure

### Required Sections
1. **Session Summary**: Brief overview of session completion
2. **Exercise Performance Analysis**: Detailed biomechanical assessment
3. **Pain Assessment**: Interpretation of pain scale and transcription
4. **Recommendations**: Specific, actionable recommendations
5. **Amber Flags**: Any unsupported statements requiring clinician review

### Citation Requirements
- Every factual statement MUST cite the JSON field: [field_name]
- Examples:
  - "Patient achieved [exercise_analytics.max_angle]° maximum flexion"
  - "Completed [exercise_analytics.reps] repetitions"
  - "Pain level reported as [pain_scale] on Wong-Baker scale"

---

## Patient-Relative Baseline Calibration

### Purpose
- Account for age-related posture differences
- Adjust for pre-existing conditions (e.g., scoliosis)
- Reduce false positives from individual anatomical variations

### Interpretation
- Compare current performance to patient's own baseline
- Deviations > 20% from baseline may indicate issues
- Deviations < 10% from baseline are within normal variation

---

## Moroccan Context Considerations

### Cultural Factors
- Low literacy: Use simple, clear language
- Darija descriptions: May use local terms for body parts/pain
- Trust in medical authority: Patients may underreport pain

### Environmental Factors
- Rural setting: Limited follow-up resources
- Mobile units: Sessions may be infrequent
- Bandwidth constraints: Reports must be actionable with minimal data

---

## Safety Thresholds

### Stop Exercise If:
- Pain score ≥ 4
- Trunk compensation > 30° from neutral
- Movement speed > 100°/second (risk of injury)
- Asymmetry > 25° between left and right sides

### Refer to Specialist If:
- Pain persists after 3 sessions
- Range of motion does not improve after 5 sessions
- Multiple warning flags in same session
- Patient reports new or worsening symptoms
