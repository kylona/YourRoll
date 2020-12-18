import * as React from 'react';
import { TouchableOpacity, Text as DefaultText, View as DefaultView } from 'react-native';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function Button(props) {
  const theme = useColorScheme()
  const {icon, size, style} = props
	const minDim = Math.min(size.x, size.y)
  const newStyle = {
    width: size.x,
    height: size.y,
		borderRadius: minDim/2,
    backgroundColor: Colors[theme].accent,
		shadowOffset: {
			width: 5,
			height: 5,
		},
		shadowColor: Colors[theme].primaryDark,
		shadowRadius: 5,
		shadowOpacity: 0.5,
		zIndex: 5,
		justifyContent: 'center',
		alignItems: 'center',
    margin: 5,
    ...style,
  }
  return (
		<TouchableOpacity style={newStyle} onPress={props.onPress} onLongPress={props.onLongPress}>
      {props.children}
		</TouchableOpacity>
  )
}

