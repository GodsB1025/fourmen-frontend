import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

type Props = {}

// TextInput 태그의 재사용성을 높이기 위해 따로 분리
const TextInput = (props: Props) => {
  return (
    <View>
      <Text>TextInput</Text>
    </View>
  )
}

export default TextInput

const styles = StyleSheet.create({})