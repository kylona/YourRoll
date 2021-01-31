import * as React from 'react';
import { Animated, StyleSheet, View, Image } from 'react-native';
import { TypingAnimation } from 'react-native-typing-animation';
import { useUpdateLayoutEffect } from './hooks/useUpdateLayoutEffect';
import Colors from '../../constants/Colors';
import Fire from '../../util/Fire.js';
const TypingIndicator = ({ isTyping }) => {
    const { yCoords, heightScale, marginScale } = React.useMemo(() => ({
        yCoords: new Animated.Value(200),
        heightScale: new Animated.Value(0),
        marginScale: new Animated.Value(0),
    }), []);
    // on isTyping fire side effect
    useUpdateLayoutEffect(() => {
        if (isTyping != {}) {
            slideIn();
        }
        else {
            slideOut();
        }
    }, [isTyping]);
    // side effect
    const slideIn = () => {
        Animated.parallel([
            Animated.spring(yCoords, {
                toValue: 0,
                useNativeDriver: false,
            }),
            Animated.timing(heightScale, {
                toValue: 20,
                duration: 250,
                useNativeDriver: false,
            }),
            Animated.timing(marginScale, {
                toValue: 8,
                duration: 250,
                useNativeDriver: false,
            }),
        ],{useNativeDriver: 'false'}).start();
    };
    // side effect
    const slideOut = () => {
        Animated.parallel([
            Animated.spring(yCoords, {
                toValue: 200,
                useNativeDriver: false,
            }),
            Animated.timing(heightScale, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false,
            }),
            Animated.timing(marginScale, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false,
            }),
        ]).start();
    };
    const renderTyping = (isTyping) => {
      let typeViews = []
      for (let t in isTyping) {
        if (t == Fire.shared.uid) continue
        if (Date.now() - isTyping[t].timestamp >= 10000){ //if they sent less then 15 seconds ago
          continue
        }
        typeViews.push(
          <Animated.View style={[
            styles.container,
            {
                transform: [
                    {
                        translateY: yCoords,
                    },
                ],
                height: heightScale,
                marginBottom: marginScale,
            },
          ]}>
          <Image style={styles.avatar} source={{uri: isTyping[t].avatar}}/>
          <TypingAnimation style={{ marginLeft: 0 , marginTop: 1 }} dotRadius={3} dotMargin={5.5} dotColor={Colors['dark'].textDark}/>
          </Animated.View>
        )
      }
      return <View style={{flexDirection:'row',}}>{typeViews}</View>
    }
    return (renderTyping(isTyping))
};
const styles = StyleSheet.create({
    container: {
        marginLeft: 8,
        width: 55,
        borderRadius: 15,
        backgroundColor: Colors['dark'].primaryLight,
        flexDirection: 'row',
    },
    avatar: {
      width: 20,
      height: 20,
      borderRadius: 10,
    },
});
export default TypingIndicator;
//# sourceMappingURL=TypingIndicator.js.map
