import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LcButton from '@/components/ui/LcButton.vue'

describe('LcButton', () => {
  it('disables while loading and keeps accessible text', () => {
    const wrapper = mount(LcButton, { props: { loading: true }, slots: { default: 'Save' } })
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Save')
  })
})
