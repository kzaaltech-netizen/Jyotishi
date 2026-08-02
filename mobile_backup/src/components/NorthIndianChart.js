import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, G } from 'react-native-svg';
import colors from '../theme/colors';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export function getSignIndex(signName) {
  if (!signName) return 0;
  const idx = ZODIAC_SIGNS.findIndex(s => s.toLowerCase() === String(signName).toLowerCase());
  return idx >= 0 ? idx : 0;
}

export default function NorthIndianChart({ chartData, size = 320 }) {
  if (!chartData) {
    return (
      <View style={[styles.emptyContainer, { width: size, height: size }]}>
        <Text style={styles.emptyText}>No chart calculated</Text>
      </View>
    );
  }

  const { lagnaSign = 'Aries', planets = [] } = chartData;
  const lagnaIdx = getSignIndex(lagnaSign);

  // Helper: Get sign number (1-12) for house (1-12)
  const getHouseSignNum = (houseNum) => {
    return ((lagnaIdx + (houseNum - 1)) % 12) + 1;
  };

  // Helper: Get planet list for house
  const getHousePlanets = (houseNum) => {
    return planets.filter(p => p.house === houseNum).map(p => p.abbr || p.name.slice(0, 2));
  };

  const center = size / 2;

  // House label coordinate positions
  const positions = {
    1:  { x: center, y: center * 0.4,   signX: center, yPlanets: center * 0.55 },
    2:  { x: center * 0.25, y: center * 0.25, signX: center * 0.25, yPlanets: center * 0.35 },
    3:  { x: center * 0.15, y: center * 0.45, signX: center * 0.15, yPlanets: center * 0.55 },
    4:  { x: center * 0.4,  y: center,       signX: center * 0.4,  yPlanets: center * 1.15 },
    5:  { x: center * 0.15, y: center * 1.55, signX: center * 0.15, yPlanets: center * 1.65 },
    6:  { x: center * 0.25, y: center * 1.75, signX: center * 0.25, yPlanets: center * 1.85 },
    7:  { x: center, y: center * 1.6,   signX: center, yPlanets: center * 1.75 },
    8:  { x: center * 1.75, y: center * 1.75, signX: center * 1.75, yPlanets: center * 1.85 },
    9:  { x: center * 1.85, y: center * 1.55, signX: center * 1.85, yPlanets: center * 1.65 },
    10: { x: center * 1.6,  y: center,       signX: center * 1.6,  yPlanets: center * 1.15 },
    11: { x: center * 1.85, y: center * 0.45, signX: center * 1.85, yPlanets: center * 0.55 },
    12: { x: center * 1.75, y: center * 0.25, signX: center * 1.75, yPlanets: center * 0.35 },
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Outer Square */}
        <Rect x={2} y={2} width={size - 4} height={size - 4} stroke={colors.primary} strokeWidth={2} fill="none" />
        
        {/* Diagonals */}
        <Line x1={2} y1={2} x2={size - 2} y2={size - 2} stroke={colors.border} strokeWidth={1.5} />
        <Line x1={size - 2} y1={2} x2={2} y2={size - 2} stroke={colors.border} strokeWidth={1.5} />
        
        {/* Inner Diamond */}
        <Line x1={center} y1={2} x2={size - 2} y2={center} stroke={colors.primary} strokeWidth={1.5} />
        <Line x1={size - 2} y1={center} x2={center} y2={size - 2} stroke={colors.primary} strokeWidth={1.5} />
        <Line x1={center} y1={size - 2} x2={2} y2={center} stroke={colors.primary} strokeWidth={1.5} />
        <Line x1={2} y1={center} x2={center} y2={2} stroke={colors.primary} strokeWidth={1.5} />

        {/* House Sign Numbers and Planets */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(hNum => {
          const signNum = getHouseSignNum(hNum);
          const housePlanets = getHousePlanets(hNum);
          const pos = positions[hNum];

          return (
            <G key={hNum}>
              {/* Sign Number */}
              <SvgText
                x={pos.x}
                y={pos.y}
                fill={colors.primaryLight}
                fontSize={12}
                fontWeight="700"
                textAnchor="middle"
              >
                {signNum}
              </SvgText>

              {/* Planets */}
              {housePlanets.map((pName, pIdx) => (
                <SvgText
                  key={pIdx}
                  x={pos.x}
                  y={pos.yPlanets + (pIdx * 11)}
                  fill={colors.accentViolet}
                  fontSize={10}
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {pName}
                </SvgText>
              ))}
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyContainer: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
