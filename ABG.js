class ABGclass {
  constructor(
    pH,
    PCO2,
    Na,
    K,
    Cl,
    HCO3,
    CaTot,
    iCa,
    Mg,
    phosphate,
    lactate,
    albumin,
    Hb,
    MeasuredOsm,
    Ur,
    Gluc,
  ) {
    this.pH = pH;
    this.PCO2 = PCO2;
    this.Na = Na;
    this.K = K;
    this.Cl = Cl;
    this.HCO3 = HCO3;
    this.CaTot = CaTot;
    this.iCa = iCa;
    this.Mg = Mg;
    this.phosphate = phosphate;
    this.lactate = lactate;
    this.albumin = albumin;
    this.Hb = Hb;
    this.MeasuredOsm = MeasuredOsm;
    this.Ur = Ur;
    this.Gluc = Gluc;
    this.AnionGap;
    this.CorrAnionGap;
    this.NormalAG;
    this.SIDa;
    this.SIDe;
    this.SIG;
    this.CO2asBicarb;
    this.AlbuminEffect;
    this.LactateEffect;
    this.NaEffect;
    this.ClEffect;
    this.NaClEffect;
    this.PhosphateEffect;
    this.DeltaGap;
    this.DeltaRatio;
    this.interpretation;
  }

  calculate() {
    //ionised calcium from total calcium:
    if (!this.iCa || (this.iCa < 0.4 && this.CaTot > 0.5)) {
      this.iCa = 0.25 * (0.9 + 2.2 * this.CaTot) - 0.03 * this.albumin;
    }
    debugg(`iCa ${this.iCa}`);

    //
    this.AnionGap = this.Na + this.K - (this.Cl + this.HCO3);
    this.CorrAnionGap =
      this.Na - (this.Cl + this.HCO3) + 0.25 * (this.albumin - 40);
    this.NormalAG = 0.2 * this.albumin + 1.5 * this.phosphate + this.lactate; // in mmol/L
    this.SIDa =
      this.Na +
      this.K +
      this.CaTot +
      2 * this.Mg +
      2 * this.iCa -
      this.Cl -
      this.lactate;

    this.AlbuminEffect = (0.123 * this.pH - 0.631) * (42 - this.albumin);
    this.CO2asBicarb = 0.23 * this.PCO2 * Math.pow(10, this.pH - 6.1);
    this.PhosphateEffect = (1.1 - this.phosphate) * (0.309 * this.pH - 0.469);

    // this.SIDe = this.CO2asBicarb + this.AlbuminEffect + this.PhosphateEffect;
    this.SIDe =
      2.46e-8 * (this.PCO2 / Math.pow(10, -this.pH)) +
      this.albumin * (0.123 * this.pH - 0.631) +
      this.phosphate * (0.309 * this.pH - 0.469);

    // this.SIDe = this.CO2asBicarb + this.AlbuminEffect + this.PhosphateEffect;
    this.SIG = this.SIDa - this.SIDe;

    //NaCl effect
    if (!this.Na) {
      this.NaEffect = NaN;
    } else {
      this.NaEffect = 0.3 * (this.Na - 140);
    }

    if (!this.Cl) {
      this.ClEffect = NaN;
    } else {
      this.ClEffect = 102 - (this.Cl * 140) / this.Na;
    }

    // console.log(`Na effect: ${this.NaEffect}`);
    // console.log(`Cl effect: ${this.ClEffect}`);

    if (this.NaEffect == NaN || this.ClEffect == NaN) {
      this.NaClEffect = NaN;
    } else {
      this.NaClEffect = this.Na - this.Cl - 38;
    }

    // Lactate Effect
    this.LactateEffect = 1.3 - this.lactate;

    //Base excess calculations
    if (this.CO2asBicarb == 0 || this.pH == 0) {
      this.sBEHb50 = NaN;
      this.sBEHbPt = NaN;
    } else {
      this.sBEHb50 =
        (this.CO2asBicarb - 24.4 + (2.3 * (50 / 10) + 7.7) * (this.pH - 7.4)) *
        (1 - (0.023 * 50) / 10);
      this.sBEHbPt =
        (this.CO2asBicarb -
          24.4 +
          (2.3 * (this.Hb / 10) + 7.7) * (this.pH - 7.4)) *
        (1 - (0.023 * this.Hb) / 10);
    }

    //delta gaps and ratios
    this.DeltaGap = this.AnionGap - 12 - (this.HCO3 - 24);
    this.DeltaRatio = this.DeltaGap / (24 - this.HCO3);

    //osm gap
    let OsmCalc = 2 * (this.Na + this.K) + this.Ur + this.Gluc;
    if (this.MeasuredOsm > 100) {
      this.OsmGap = this.MeasuredOsm - this.OsmCalc;
    } else {
      this.OsmGap = "";
    }
  }

  display() {
    document.getElementById("AnionGapBox").innerText = Number(
      this.AnionGap,
    ).toFixed(1);
    document.getElementById("CorrAnionGapBox").innerText = Number(
      this.CorrAnionGap,
    ).toFixed(1);
    document.getElementById("SIDaBox").innerText = Number(this.SIDa).toFixed(1);
    document.getElementById("SIDeBox").innerText = Number(this.SIDe).toFixed(1);
    document.getElementById("SIGBox").innerText = Number(this.SIG).toFixed(1);
    document.getElementById("NaClEffectBox").innerText = Number(
      this.NaClEffect,
    ).toFixed(1);
    document.getElementById("LactateEffectBox").innerText = Number(
      this.LactateEffect,
    ).toFixed(1);
    document.getElementById("PhosphateEffectBox").innerText = Number(
      this.PhosphateEffect,
    ).toFixed(1);
    document.getElementById("CO2asBicarbBox").innerText = Number(
      this.CO2asBicarb,
    ).toFixed(1);
    document.getElementById("sBEHb50Box").innerText = Number(
      this.sBEHb50,
    ).toFixed(1);
    document.getElementById("sBEHbPtBox").innerText = Number(
      this.sBEHbPt,
    ).toFixed(1);
    document.getElementById("AlbuminEffectBox").innerText = Number(
      this.AlbuminEffect,
    ).toFixed(1);

    //avoid displaying Osm Gap if non-sensical
    if (this.MeasuredOsm < this.OsmCalc) {
      document.getElementById("OsmGapBox").innerText = "";
    } else {
      document.getElementById("OsmGapBox").innerText = Number(
        this.OsmGap,
      ).toFixed(1);
    }

    //avoid displaying BE if absent values
    if (!this.sBEHb50) {
      document.getElementById("sBEHb50Box").innerText = "";
    } else {
      document.getElementById("sBEHb50Box").innerText = Number(
        this.sBEHb50,
      ).toFixed(1);
    }
    if (!this.sBEHbPt) {
      document.getElementById("sBEHbPtBox").innerText = "";
    } else {
      document.getElementById("sBEHbPtBox").innerText = Number(
        this.sBEHb50,
      ).toFixed(1);
    }

    //avoid displaying NaCl
    if (!this.NaClEffect) {
    } else {
    }

    //avoid displaying delta values if HCO3 is normal
    if (this.HCO3 >= 20 && this.HCO3 <= 28) {
      debugg("no d gap or ration because of logic");
      document.getElementById("DeltaGapBox").innerText = "";
      document.getElementById("DeltaRatioBox").innerText = "";
    } else {
      document.getElementById("DeltaGapBox").innerText = Number(
        this.DeltaGap,
      ).toFixed(1);
      document.getElementById("DeltaRatioBox").innerText = Number(
        this.DeltaRatio,
      ).toFixed(2);
    }

    //AG bix colour
    if (this.AnionGap > 16) {
      let anionGapColour =
        "rgb(255," +
        map(this.AnionGap, 16, 40, 230, 0) +
        "," +
        map(this.AnionGap, 16, 40, 230, 0) +
        ")";
      document.getElementById("AnionGapBox").style.background = anionGapColour;
    } else {
      document.getElementById("AnionGapBox").style.background = "lightblue";
    }

    //albumin effect box colour
    let albuminEffectColour;
    if (this.AlbuminEffect < -2.0) {
      albuminEffectColour =
        "rgb(255," +
        map(this.AlbuminEffect, -2.1, -15, 230, 0) +
        "," +
        map(this.AlbuminEffect, -2.1, -15, 230, 0) +
        ")";
    } else if (this.AlbuminEffect >= 2.0) {
      albuminEffectColour =
        "rgb(" +
        map(this.AlbuminEffect, 2.1, 30, 230, 0) +
        "," +
        map(this.AlbuminEffect, 2.1, 30, 236, 60) +
        ",255)";
    } else {
      albuminEffectColour = "lightblue";
    }
    document.getElementById("AlbuminEffectBox").style.background =
      albuminEffectColour;

    //lactate effect box colour
    if (this.LactateEffect < -2.0) {
      let LactateEffectColour =
        "rgb(255," +
        map(this.LactateEffect, -2.1, -15, 230, 0) +
        "," +
        map(this.LactateEffect, -2.1, -15, 230, 0) +
        ")";
      document.getElementById("LactateEffectBox").style.background =
        LactateEffectColour;
    } else {
      document.getElementById("LactateEffectBox").style.background =
        "lightblue";
    }

    //NaCl effect box colour
    let NaClEffectColour;
    if (this.NaClEffect < -2.0) {
      NaClEffectColour =
        "rgb(255," +
        map(this.NaClEffect, -2.1, -30, 230, 0) +
        "," +
        map(this.NaClEffect, -2.1, -30, 230, 0) +
        ")";
    } else if (this.NaClEffect >= 2.0) {
      NaClEffectColour =
        "rgb(" +
        map(this.NaClEffect, 2.1, 30, 230, 0) +
        "," +
        map(this.NaClEffect, 2.1, 30, 236, 60) +
        ",255)";
    } else {
      NaClEffectColour = "lightblue";
    }
    document.getElementById("NaClEffectBox").style.background =
      NaClEffectColour;

    //SIDa box colour
    let SIDaBoxColour;
    if (this.SIDa < 40) {
      SIDaBoxColour =
        "rgb(255," +
        map(this.SIDa, 40, 10, 230, 0) +
        "," +
        map(this.SIDa, 40, 10, 230, 0) +
        ")";
    } else if (this.SIDa > 44) {
      SIDaBoxColour =
        "rgb(" +
        map(this.SIDa, 44, 70, 230, 0) +
        "," +
        map(this.SIDa, 44, 70, 236, 60) +
        ",255)";
    } else {
      SIDaBoxColour = "lightblue";
    }
    document.getElementById("SIDaBox").style.background = SIDaBoxColour;
    debugg(SIDaBoxColour);
  }

  updateInterpretation() {
    debugg("Updating Interpretation...");
    debugg(this.pH);

    const abgPatterns = [
      {
        //done
        pH: "low",
        CsO2: "high",
        HCO3: "normal",
        meaning: "Uncompensated respiratory acidosis",
        metabolicAcidosis: false,
      },
      {
        //done
        pH: "low",
        CO2: "normal",
        HCO3: "low",
        meaning: "Uncompensated metabolic acidosis",
        metabolicAcidosis: true,
      },

      {
        //done
        pH: "high",
        CO2: "low",
        HCO3: "normal",
        meaning: "Uncompensated respiratory alkalosis",
        metabolicAcidosis: false,
      },
      {
        //done
        pH: "high",
        CO2: "normal",
        HCO3: "high",
        meaning: "Uncompensated metabolic alkalosis",
        metabolicAcidosis: false,
      },

      {
        //done
        pH: "low",
        CO2: "high",
        HCO3: "high",
        meaning: "Partially compensated respiratory acidosis",
        metabolicAcidosis: false,
      },
      {
        //done
        pH: "low",
        CO2: "low",
        HCO3: "low",
        meaning: "Partially compensated metabolic acidosis",
        metabolicAcidosis: true,
      },

      {
        //done
        pH: "high",
        CO2: "low",
        HCO3: "low",
        meaning: "Partially compensated respiratory alkalosis",
        metabolicAcidosis: true,
      },
      {
        //done
        pH: "high",
        CO2: "high",
        HCO3: "high",
        meaning: "Partially compensated metabolic alkalosis",
        metabolicAcidosis: false,
      },

      {
        //done
        pH: "low normal",
        CO2: "high",
        HCO3: "high",
        meaning: "Compensated respiratory acidosis",
        metabolicAcidosis: false,
      },
      {
        //done
        pH: "high normal",
        CO2: "high",
        HCO3: "high",
        meaning: "Compensated metabolic alkalosis",
        metabolicAcidosis: false,
      },

      {
        //done
        pH: "low normal",
        CO2: "low",
        HCO3: "low",
        meaning: "Compensated metabolic acidosis",
        metabolicAcidosis: true,
      },
      {
        //done
        pH: "high normal",
        CO2: "low",
        HCO3: "low",
        meaning: "Compensated respiratory alkalosis",
        metabolicAcidosis: true,
      },

      {
        //done
        pH: "low",
        CO2: "high",
        HCO3: "low",
        meaning: "Mixed metabolic and respiratory acidosis",
        metabolicAcidosis: true,
      },

      {
        //done
        pH: "high",
        CO2: "low",
        HCO3: "high",
        meaning: "Mixed metabolic and respiratory alkalosis",
        metabolicAcidosis: true,
      },

      {
        //done
        pH: "low normal",
        CO2: "normal",
        HCO3: "normal",
        meaning: "Normal ABG",
        metabolicAcidosis: false,
      },
      {
        //done
        pH: "high normal",
        CO2: "normal",
        HCO3: "normal",
        meaning: "Normal ABG",
        metabolicAcidosis: false,
      },
      {
        //done
        pH: "normal",
        CO2: "normal",
        HCO3: "normal",
        meaning: "Normal ABG",
        metabolicAcidosis: false,
      },
    ];

    if (debugging) {
      console.log(abgPatterns);
    }

    let pHdisturbance, PCO2disturbance, HCO3disturbance;
    let metabolicAcidosis = false;

    if (this.pH < 7.35) {
      pHdisturbance = "low";
    } else if (this.pH > 7.45) {
      pHdisturbance = "high";
    } else if (this.pH < 7.4) {
      pHdisturbance = "low normal";
    } else {
      pHdisturbance = "high normal";
    }

    if (this.PCO2 < 4.0) {
      PCO2disturbance = "low";
    } else if (this.PCO2 > 6.0) {
      PCO2disturbance = "high";
    } else {
      PCO2disturbance = "normal";
    }

    if (this.HCO3 < 22) {
      HCO3disturbance = "low";
    } else if (this.HCO3 > 26) {
      HCO3disturbance = "high";
    } else {
      HCO3disturbance = "normal";
    }

    this.interpretationText =
      abgPatterns.find(
        (row) =>
          row.pH === pHdisturbance &&
          row.CO2 === PCO2disturbance &&
          row.HCO3 === HCO3disturbance,
      )?.meaning || "Pattern not recognised — consider mixed disorder";

    this.interpretationText += `\n(pH  ${pHdisturbance}, PCO2 ${PCO2disturbance}, bicarb ${HCO3disturbance})\n`;

    debugg("int txt: " + this.interpretationText);

    //if (this.interpretationText.includes("metabolic acidosis")) {
    if (
      this.interpretationText.includes("metabolic acidosis") ||
      (this.pH < 7.35 && this.PCO2 < 6.0) ||
      this.HCO3 < 24 ||
      metabolicAcidosis == true
    ) {
      debugg("Metabolic acidosis detected. Aniong gap is " + this.AnionGap);
      // this.interpretationText += "\nMetabolic acidosis present. ";

      if (this.AnionGap > 16) {
        debugg("well, AG is high ");
        this.interpretationText += "HAGMA";

        //Delta ratios
        if (this.DeltaRatio >= 2) {
          this.interpretationText += `. Delta ratio (${this.DeltaRatio.toFixed(1)}) suggests a concurrent metabolic alkalosis or pre-existing high bicarbonate.`;
        } else if (this.DeltaRatio > 1.0 && this.DeltaRatio < 2.0) {
          this.interpretationText += `. Delta ratio (${this.DeltaRatio.toFixed(1)}) suggests uncomplicated HAGMA.`;
        } else if (DeltaRatio >= 0.8 && DeltaRatio <= 1.0) {
          this.interpretationText += `. Delta ratio (${this.DeltaRatio.toFixed(1)}) unhelpful.`;
        } else if (this.DeltaRatio > 0.4 && this.DeltaRatio < 0.8) {
          this.interpretationText += `. Delta ratio (${this.DeltaRatio.toFixed(1)}) suggests mixed NAGMA and HAGMA.`;
        } else if (this.DeltaRatio <= 0.4) {
          this.interpretationText += `. Delta ratio (${this.DeltaRatio} suggest pure NAGMA`;
        }

        //osmolar gap
        if (this.OsmGap >= 16) {
          this.interpretationText +=
            ". Raised osmolar gap — consider toxic alcohol ingestion.";
        }
      } else if (this.AnionGap <= 16) {
        debugg("well AG is LOW!! ");
        this.interpretationText += "NAGMA.";
      }
    }

    if (this.LactateEffect < -2) {
      this.interpretationText += `\nLactic acidosis. Lactate effect ${this.LactateEffect.toFixed(1)} on sBE`;
    }

    if (this.NaClEffect <= -4) {
      this.interpretationText += `\nHyperchloraemic acidosis. NaCl effect ${this.NaClEffect.toFixed(1)} on sBE`;
    }

    if (this.AlbuminEffect > 2) {
      this.interpretationText += `\nHypoalbuminaemic alkalosis. Albumin effect ${this.AlbuminEffect.toFixed(1)} on sBE`;
    }

    debugg(this.interpretationText);
    document.getElementById("interpretationBox").innerText =
      this.interpretationText;

    this.plotSiggardAndersson();
  }

  plotSiggardAndersson() {
    debugg("Plotting SA nomogram...");
    debugg(img);
    debugg(canvas);

    function mapValue(value, inMin, inMax, outMin, outMax) {
      return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }
    function constrain(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    // clear();

    // // Draw border and image
    // stroke(0);
    // strokeWeight(2);
    // noFill();
    // rect(0, 0, width, height);
    // image(img, 0, 0, width, height);

    // // Plot the point based on pH and HCO3
    // let plotXstart = (38 / 400) * width;
    // let plotYstart = (30 / 400) * height;

    // let plotWidth = ((400 - 10) / 400) * width;
    // let plotHeight = ((400 - 25) / 400) * height;

    // let x = map(this.pH, 7.0, 7.8, plotXstart, plotWidth);
    // let y = map(this.HCO3, 0, 60, plotHeight, plotYstart);

    // x = constrain(x, plotXstart, plotWidth);
    // y = constrain(y, plotYstart, plotHeight);

    // if (debugging) {
    //   console.log(`Mapped coordinates: x=${x}, y=${y}`);
    // }

    // noFill();
    // stroke(255, 0, 0);
    // ellipse(x, y, 10, 10);

    ctx.clearRect(0, 0, SAcanvas.width, SAcanvas.height);

    // Draw border
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.strokeRect(0, 0, SAcanvas.width, SAcanvas.height);

    // Draw image (p5 image(img, 0, 0, width, height))
    ctx.drawImage(img, 0, 0, SAcanvas.width, SAcanvas.height);

    // Plot area offsets (same math as p5 version)
    let plotXstart = (38 / 400) * SAcanvas.width;
    let plotYstart = (30 / 400) * SAcanvas.height;

    let plotWidth = ((400 - 10) / 400) * SAcanvas.width;
    let plotHeight = ((400 - 25) / 400) * SAcanvas.height;

    // map() replacements
    let x = mapValue(this.pH, 7.0, 7.8, plotXstart, plotWidth);
    let y = mapValue(this.HCO3, 0, 60, plotHeight, plotYstart);

    // constrain() replacements
    x = constrain(x, plotXstart, plotWidth);
    y = constrain(y, plotYstart, plotHeight);

    if (debugging) {
      console.log(`Mapped coordinates: x=${x}, y=${y}`);
    }

    // Draw ellipse replacement (circle)
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";
    ctx.arc(x, y, 5, 0, Math.PI * 2); // radius=5 => diameter=10
    ctx.stroke();
  }

  drawGamblegram() {
    //placeholder function for Gamblegram
    if (debugging) {
      debugg("Drawing Gamblegram...");
    }
  }

  // instance -> plain object
  toJSON() {
    return {
      pH: this.pH,
      PCO2: this.PCO2,
      Na: this.Na,
      K: this.K,
      Cl: this.Cl,
      HCO3: this.HCO3,
      CaTot: this.CaTot,
      iCa: this.iCa,
      Mg: this.Mg,
      phosphate: this.phosphate,
      lactate: this.lactate,
      albumin: this.albumin,
      Hb: this.Hb,
      MeasuredOsm: this.MeasuredOsm,
      Ur: this.Ur,
      Gluc: this.Gluc,
    };
  }

  // plain object -> instance
  static fromJSON(data) {
    return new ABGclass(
      data.pH,
      data.PCO2,
      data.Na,
      data.K,
      data.Cl,
      data.HCO3,
      data.CaTot,
      data.iCa,
      data.Mg,
      data.phosphate,
      data.lactate,
      data.albumin,
      data.Hb,
      data.MeasuredOsm,
      data.Ur,
      data.Gluc,
    );
  }

  loadABGintoInputFields() {
    debugg("Updating input fields");
    // Get references to the input elements by their IDs
    // Ensure that your HTML has input elements with these exact IDs (e.g., <input id="pHValue">)
    pHValue.value = float(this.pH);
    PCO2Value.value = float(this.PCO2);
    HCO3Value.value = float(this.HCO3);
    NaValue.value = float(this.Na);
    KValue.value = float(this.K);
    ClValue.value = float(this.Cl);
    CaTotValue.value = float(this.CaTot);
    iCaValue.value = float(this.iCa);
    MgValue.value = float(this.Mg);
    AlbuminValue.value = float(this.albumin);
    PhosphateValue.value = float(this.phosphate);
    LactateValue.value = float(this.lactate);
    HbValue.value = float(this.Hb);
    MeasuredOsmValue.value = float(this.MeasuredOsm);
    UreaValue.value = float(this.Ur);
    GlucoseValue.value = float(this.Gluc);
  }
}
