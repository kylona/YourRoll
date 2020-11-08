import * as React from 'react';
import {Animated, Image, Platform, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import Recorder from '../util/Recorder';
import Fire from '../util/Fire';
import Colors from '../constants/Colors.ts';
import { Ionicons } from '@expo/vector-icons';
import useColorScheme from '../hooks/useColorScheme';
import oofReact from '../assets/images/oof.png';
import komReact from '../assets/images/kombucha.png';
import tudReact from '../assets/images/ThumbsUpDrake.png';
import tddReact from '../assets/images/ThumbsDownDrake.png';
import ccrReact from '../assets/images/CatCry.png';
import cwoReact from '../assets/images/ChrisWow.png';
import lolReact from '../assets/images/Lol.png';
import lvmReact from '../assets/images/LoveMeme.png';

export default function ReactionDisplay(props) {
  if (props.pos == null || props.reactions== null) return null
  const theme = useColorScheme()
  const [panelScaleVal, setPanelScale] = React.useState(0)
  let panelScale = new Animated.Value(panelScaleVal);
  panelScale.addListener((value) => {
    setPanelScale(value.value)
  })


  let panelWidth = Platform.OS == 'ios' ? 450 : 400
  let maxScale = Dimensions.get('window').width/panelWidth

  React.useEffect(() => {
    panelScale.setValue(0) 
    if (props.pos) {
      Animated.timing(panelScale, {
        toValue: maxScale,
        duration: 150,
        isInteraction: true,
        useNativeDriver: false,
      }).start();
    }
  },[props.pos]);

  let containerStyle = (scale) => { return ({
    zIndex: 5,
    flexDirection: 'row',
    height: 360,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: scale/maxScale,
    transform: [
      { translateX: 0},
      { translateY: props.pos.y - 150 },
      { scale: scale },
    ]
  })}

  let reactionDisplay = []
  for (let r in props.reactions) {
    let reactImage = null
    let reactionText = props.reactions[r].reaction
		if(reactionText.includes("oof")) {
      reactionImage = (<Image key={Math.random()} style={styles.oof} source={oofReact}/>)
    }
    else if (reactionText.includes("kombucha")) {
      reactionImage = (<Image key={Math.random()} style={styles.oof} source={komReact}/>)
    }
    else if(reactionText.includes("👍")) {
      reactionImage = (<Image key={Math.random()} style={styles.oof} source={tudReact}/>)
    }
    else if(reactionText.includes("👎")) {
      reactionImage = (<Image key={Math.random()} style={styles.oof} source={tddReact}/>)
    }
    else if(reactionText.includes("😭")) {
      reactionImage = (<Image key={Math.random()} style={styles.oof} source={ccrReact}/>)
    }
    else if(reactionText.includes("😎")) {
      reactionImage = (<Image key={Math.random()} style={styles.oof} source={cwoReact}/>)
    }
    else if (reactionText.includes("😂")) {
      reactionImage = (<Image key={Math.random()} style={styles.oof} source={lolReact}/>)
    }
    else if(reactionText.includes("😍")) {
      reactionImage = (<Image key={Math.random()} style={styles.oof} source={lvmReact}/>)
    }
    else {
      reactionImage = <Text style={styles.reactionEmoji}>{props.reactions[r].reaction}</Text>
    }
    <Image key={Math.random()} style={styles.oof} source={oofReact}/>
    reactionDisplay.push(
      <View key={r} style={{width: '100%', flexDirection:'row', alignItems:'center', justifyContent:'center',}}>
        <Image style={styles.avatar} source={{uri: props.reactions[r].user.avatar}}/>
        <Text style={{...styles.label, alignSelf:'center', flex: 1}}>{props.reactions[r].user.name}</Text>
        {reactionImage}
      </View>
    )
  }



  return (
    <TouchableOpacity
      activeOpacity={1}
      style={{backroundColor: 'black', width: '100%', height:'100%'}}
      onPress={() => {
        Animated.timing(panelScale, {
          toValue: 0,
          duration: 100,
          isInteraction: true,
          useNativeDriver: false,
        }).start(() => {
          if (props.dismissPressed) props.dismissPressed()
        });
      }}
    >
      <View style={containerStyle(panelScaleVal)}>
        <View style={styles.emojiContainer}>
          <Text style={styles.title}>Reactions</Text>
          {reactionDisplay}
        </View>
      </View>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
  },
  roundContainer: {
    flexDirection: 'row',
    flex: 0,
    padding: 5,
    width: 45,
    height: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    backgroundColor: Colors['dark'].primary
  },
  emojiContainer: {
    flex: 0,
    height: '100%',
    width: '90%',
    paddingLeft: 20,
    paddingRight: 20,
    margin: 5,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 30,
    backgroundColor: Colors['dark'].primary
  },
  reactionEmoji: {
    flex: 1,
    fontSize: Platform.OS == 'ios' ? 21 : 18,
    textAlign:'right',
    fontWeight: 'bold',
    color: Colors['dark'].textDark,
    marginLeft: 3,
    marginRight: 3,
  },
  title: {
    fontSize: Platform.OS == 'ios' ? 27 : 20,
    fontWeight: 'bold',
    color: Colors['dark'].textLight,
    margin: 10,
  },
  label: {
    fontSize: Platform.OS == 'ios' ? 21 : 18,
    fontWeight: 'bold',
    color: Colors['dark'].textLight,
    margin: 5,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 5,
    marginRight: 10,
    alignSelf: 'center',
  },
  oof: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 5,
    marginRight: 10,
    alignSelf: 'center',
  }
});
