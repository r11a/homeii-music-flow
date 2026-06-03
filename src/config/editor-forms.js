let editorFormDeps = {
  homeiiEditorI18n: (key, _params = {}, fallback = "") => fallback || key,
  homeiiEditorLabelFor: (schema = {}, labels = {}) => labels?.[schema?.name] || schema?.label || schema?.title || schema?.name || "",
  homeiiEditorHelperFor: (schema = {}, helpers = {}) => helpers?.[schema?.name] || schema?.helper || "",
  detectEditorHebrew: () => false,
  visibleLanguageOptions: [],
  radioBrowserCountrySelectorOptions: (translateFn = null) => [{ value: "all", label: typeof translateFn === "function" ? translateFn("ui.all_countries") : "ui.all_countries" }],
};

export function configureHomeiiEditorForms(deps = {}) {
  editorFormDeps = {
    ...editorFormDeps,
    ...deps,
  };
}
function homeiiEditorI18n(key, params = {}, fallback = "") {
  return editorFormDeps.homeiiEditorI18n(key, params, fallback);
}

const HomeiiEditorLocale = Object.freeze({
  detectEditorHebrew() {
    return editorFormDeps.detectEditorHebrew();
  },
});

function homeiiEditorLabelFor(schema = {}, labels = {}) {
  return editorFormDeps.homeiiEditorLabelFor(schema, labels);
}

function homeiiEditorHelperFor(schema = {}, helpers = {}) {
  return editorFormDeps.homeiiEditorHelperFor(schema, helpers);
}

function visibleLanguageOptions() {
  return Array.isArray(editorFormDeps.visibleLanguageOptions) ? editorFormDeps.visibleLanguageOptions : [];
}

function homeiiRadioBrowserCountrySelectorOptions(translateFn = null, language = "en") {
  return editorFormDeps.radioBrowserCountrySelectorOptions(translateFn, language);
}

export function getBaseCardConfigForm() {
  const labels = {
    config_entry_id: "Config Entry ID",
    ma_url: homeiiEditorI18n("ui.music_assistant_url"),
    music_assistant_external_url: "Music Assistant external URL",
    ma_token: homeiiEditorI18n("ui.music_assistant_token"),
    active_player_helper_entity: homeiiEditorI18n("ui.active_player_helper"),
    ma_interface_url: homeiiEditorI18n("ui.ma_interface_path"),
    ma_interface_target: homeiiEditorI18n("ui.open_interface_in"),
    show_ma_button: homeiiEditorI18n("ui.show_ma_button"),
    show_theme_toggle: homeiiEditorI18n("ui.show_theme_toggle"),
    cache_ttl: homeiiEditorI18n("ui.cache_ttl"),
    music_assistant_timeout_ms: "Music Assistant timeout",
    language: homeiiEditorI18n("ui.language"),
    theme_mode: homeiiEditorI18n("ui.theme_mode"),
    hotel_mode: homeiiEditorI18n("ui.hotel_mode", {}, "Hotel Mode"),
    show_confirmation_toasts: homeiiEditorI18n("ui.show_confirmation_toasts", {}, "Show confirmation messages"),
    performance_profile: homeiiEditorI18n("ui.performance_profile"),
    performance_mode: homeiiEditorI18n("ui.performance_mode_for_weak_devices"),
    night_mode: homeiiEditorI18n("ui.night_mode"),
    night_mode_auto_start: homeiiEditorI18n("ui.night_start_time"),
    night_mode_auto_end: homeiiEditorI18n("ui.night_end_time"),
    rtl: "RTL",
    main_opacity: homeiiEditorI18n("ui.main_opacity"),
    popup_opacity: homeiiEditorI18n("ui.popup_opacity"),
  };
  const helpers = {
    config_entry_id: homeiiEditorI18n("ui.music_assistant_config_entry_id_if_you_want_direct_integration_lookup_th"),
    ma_url: homeiiEditorI18n("ui.leave_empty_if_the_card_should_use_home_assistant_only"),
    music_assistant_external_url: "Optional HTTPS Music Assistant URL for HTTPS dashboards, Nabu Casa, and Companion App browser-player connections.",
    ma_token: homeiiEditorI18n("ui.only_needed_when_using_a_direct_music_assistant_url"),
    active_player_helper_entity: homeiiEditorI18n("ui.optional_input_text_helper_updated_with_the_active_player_entity_id_for"),
    ma_interface_url: homeiiEditorI18n("ui.path_used_when_opening_the_music_assistant_interface"),
    cache_ttl: homeiiEditorI18n("ui.cache_duration_in_milliseconds_for_selected_data_requests"),
    music_assistant_timeout_ms: "Maximum milliseconds to wait for Music Assistant service responses before showing an error.",
    hotel_mode: homeiiEditorI18n("ui.hotel_mode_helper", {}, "Minimal hotel-safe UI: player controls, volume, search, artwork browsing, and player selection only."),
    show_confirmation_toasts: homeiiEditorI18n("ui.show_confirmation_toasts_helper", {}, "Show brief confirmation messages after actions like selecting a player or adding to liked. Disable to suppress these; error messages still appear regardless."),
    performance_profile: homeiiEditorI18n("ui.performance_profile_helper"),
    performance_mode: homeiiEditorI18n("ui.disables_blur_animations_dynamic_backgrounds_and_heavy_shadows_recommend"),
    main_opacity: homeiiEditorI18n("ui.opacity_for_the_main_card_background"),
    popup_opacity: homeiiEditorI18n("ui.opacity_for_popups_and_overlays"),
  };
  return {
    schema: [
      {
        type: "expandable",
        name: "general_section",
        title: homeiiEditorI18n("ui.general_and_display"),
        flatten: true,
        schema: [
          {
            type: "grid",
            name: "general_grid",
            flatten: true,
            column_min_width: "220px",
            schema: [
              { name: "language", selector: { select: { mode: "dropdown", options: visibleLanguageOptions() } } },
              { name: "theme_mode", selector: { select: { mode: "dropdown", options: [
                { value: "auto", label: "Auto" },
                { value: "dark", label: homeiiEditorI18n("ui.dark") },
                { value: "light", label: homeiiEditorI18n("ui.light") },
                { value: "custom", label: homeiiEditorI18n("ui.custom") },
              ] } } },
              { name: "performance_profile", selector: { select: { mode: "dropdown", options: [
                { value: "full", label: "Full" },
                { value: "high", label: "High" },
                { value: "low", label: "Low" },
                { value: "ultra_lite", label: "Ultra Lite" },
              ] } } },
              { name: "rtl", selector: { boolean: {} } },
              { name: "hotel_mode", selector: { boolean: {} } },
              { name: "show_confirmation_toasts", selector: { boolean: {} } },
              { name: "main_opacity", selector: { number: { min: 0.3, max: 1, step: 0.02, mode: "box" } } },
              { name: "popup_opacity", selector: { number: { min: 0.4, max: 1, step: 0.02, mode: "box" } } },
            ],
          },
        ],
      },
      {
        type: "expandable",
        name: "connection_section",
        title: homeiiEditorI18n("ui.connection_and_behavior"),
        flatten: true,
        schema: [
          {
            type: "grid",
            name: "connection_grid",
            flatten: true,
            column_min_width: "220px",
            schema: [
              { name: "config_entry_id", selector: { text: {} } },
              { name: "ma_url", selector: { text: { type: "url" } } },
              { name: "music_assistant_external_url", selector: { text: { type: "url" } } },
              { name: "ma_token", selector: { text: {} } },
              { name: "active_player_helper_entity", selector: { entity: { multiple: false, filter: [{ domain: "input_text" }] } } },
              { name: "ma_interface_url", selector: { text: {} } },
              { name: "ma_interface_target", selector: { select: { mode: "dropdown", options: [
                { value: "_self", label: "_self" },
                { value: "_blank", label: "_blank" },
              ] } } },
              { name: "show_ma_button", selector: { boolean: {} } },
              { name: "show_theme_toggle", selector: { boolean: {} } },
              { name: "cache_ttl", selector: { number: { min: 0, max: 3600000, step: 1000, mode: "box" } } },
              { name: "music_assistant_timeout_ms", selector: { number: { min: 3000, max: 60000, step: 1000, mode: "box" } } },
            ],
          },
        ],
      },
    ],
    computeLabel: (schema) => homeiiEditorLabelFor(schema, labels),
    computeHelper: (schema) => homeiiEditorHelperFor(schema, helpers),
    assertConfig: (config) => {
      if (!config || typeof config !== "object" || Array.isArray(config)) {
        throw new Error("Card config must be an object");
      }
    },
  };
}
export function getMobileEditorTexts() {
  const quickActionSlotLabels = {};
  const quickActionSlotHelpers = {};
  for (let index = 1; index <= 10; index += 1) {
    quickActionSlotLabels[`mobile_quick_action_${index}`] = `${homeiiEditorI18n("ui.quick_actions")} ${index}`;
    quickActionSlotHelpers[`mobile_quick_action_${index}`] = homeiiEditorI18n("ui.set_the_visual_order_of_quick_actions");
  }
  const playerOrderSlotLabels = {};
  const playerOrderSlotHelpers = {};
  for (let index = 1; index <= 20; index += 1) {
    playerOrderSlotLabels[`player_order_entity_${index}`] = `${homeiiEditorI18n("ui.player_order")} ${index}`;
    playerOrderSlotHelpers[`player_order_entity_${index}`] = homeiiEditorI18n("ui.set_custom_player_order");
  }
  const auxiliaryLabels = {};
  const auxiliaryHelpers = {};
  for (let index = 2; index <= 4; index += 1) {
    auxiliaryLabels[`aux_button_${index}_enabled`] = `${homeiiEditorI18n("ui.auxiliary_button")} ${index}`;
    auxiliaryLabels[`aux_button_${index}_name`] = `${homeiiEditorI18n("ui.auxiliary_button_name")} ${index}`;
    auxiliaryLabels[`aux_button_${index}_icon`] = `${homeiiEditorI18n("ui.auxiliary_button_icon")} ${index}`;
    auxiliaryLabels[`aux_button_${index}_action`] = `${homeiiEditorI18n("ui.auxiliary_button_action")} ${index}`;
    auxiliaryLabels[`aux_button_${index}_entity`] = `${homeiiEditorI18n("ui.auxiliary_button_entity")} ${index}`;
    auxiliaryHelpers[`aux_button_${index}_enabled`] = homeiiEditorI18n("ui.show_auxiliary_button_in_quick_actions");
  }
  const quickActionOptions = [
    { value: "home", label: homeiiEditorI18n("ui.home") },
    { value: "search", label: homeiiEditorI18n("ui.search") },
    { value: "timer", label: homeiiEditorI18n("ui.timer") },
    { value: "like", label: homeiiEditorI18n("ui.like_2") },
    { value: "lyrics", label: homeiiEditorI18n("ui.lyrics") },
    { value: "queue", label: homeiiEditorI18n("ui.queue_2") },
    { value: "radio", label: homeiiEditorI18n("ui.quick_mix") },
    { value: "voice", label: homeiiEditorI18n("ui.flow_assistant", {}, "FLOW ASSISTANT") },
    { value: "history", label: homeiiEditorI18n("ui.history") },
    { value: "info", label: homeiiEditorI18n("ui.info") },
    { value: "disconnect_all", label: homeiiEditorI18n("ui.clean_all", {}, HomeiiEditorLocale.detectEditorHebrew() ? "נקה הכל" : "Clean all") },
  ];
  return {
    sections: {
      general: homeiiEditorI18n("ui.general"),
      appearance: homeiiEditorI18n("ui.appearance"),
      behavior: homeiiEditorI18n("ui.behavior"),
      connection: homeiiEditorI18n("ui.connection_and_behavior"),
      mainbar: homeiiEditorI18n("ui.main_bar"),
      quickactions: homeiiEditorI18n("ui.quick_actions_2"),
      library: homeiiEditorI18n("ui.library_tabs"),
      announcements: homeiiEditorI18n("ui.announcements"),
      voice_assistant: homeiiEditorI18n("ui.flow_assistant", {}, "FLOW ASSISTANT"),
      players: homeiiEditorI18n("ui.players"),
      smart_home: homeiiEditorI18n("ui.smart_home"),
    },
    labels: {
      settings_source: homeiiEditorI18n("ui.settings_source"),
      layout_mode: homeiiEditorI18n("ui.layout_mode"),
      main_opacity: homeiiEditorI18n("ui.main_opacity"),
      popup_opacity: homeiiEditorI18n("ui.popup_opacity"),
      height: homeiiEditorI18n("ui.card_height"),
      language: homeiiEditorI18n("ui.language"),
      theme_mode: homeiiEditorI18n("ui.theme_mode"),
      performance_profile: homeiiEditorI18n("ui.performance_profile"),
      performance_mode: homeiiEditorI18n("ui.performance_mode_for_weak_devices"),
      night_mode: homeiiEditorI18n("ui.night_mode"),
      night_mode_auto_start: homeiiEditorI18n("ui.night_start_time"),
      night_mode_auto_end: homeiiEditorI18n("ui.night_end_time"),
      night_mode_days: homeiiEditorI18n("ui.night_mode_days"),
      rtl: "RTL",
      mobile_custom_color: homeiiEditorI18n("ui.accent_color"),
      mobile_dynamic_theme_mode: homeiiEditorI18n("ui.dynamic_theme"),
      mobile_background_motion_mode: homeiiEditorI18n("ui.background_motion"),
      mobile_custom_text_tone: homeiiEditorI18n("ui.text_tone"),
      mobile_font_scale: homeiiEditorI18n("ui.font_scale"),
      mobile_icon_scale: homeiiEditorI18n("ui.icon_size"),
      mobile_compact_mode: homeiiEditorI18n("ui.compact_mode"),
      mobile_compact_widget_mode: homeiiEditorI18n("ui.compact_widget_mode", {}, "Compact widget style"),
      mobile_compact_edge_to_edge: homeiiEditorI18n("ui.compact_edge_to_edge", {}, "Compact edge-to-edge expand"),
      mobile_layout_mode: homeiiEditorI18n("ui.mobile_layout_mode", {}, "Phone layout mode"),
      mobile_swipe_mode: homeiiEditorI18n("ui.artwork_swipe"),
      mobile_footer_search_enabled: homeiiEditorI18n("ui.footer_search"),
      mobile_mic_mode: homeiiEditorI18n("ui.microphone_2"),
      mobile_footer_mode: homeiiEditorI18n("ui.footer_style_2"),
      mobile_studio_shortcut: homeiiEditorI18n("ui.studio_shortcut"),
      mobile_home_shortcut: homeiiEditorI18n("ui.home_shortcut"),
      mobile_home_shortcut_path: homeiiEditorI18n("ui.home_shortcut_path"),
      hotel_mode: homeiiEditorI18n("ui.hotel_mode", {}, "Hotel Mode"),
      show_confirmation_toasts: homeiiEditorI18n("ui.show_confirmation_toasts", {}, "Show confirmation messages"),
      mobile_volume_mode: homeiiEditorI18n("ui.volume_mode"),
      mobile_volume_step_buttons: homeiiEditorI18n("ui.volume_step_buttons"),
      mobile_volume_step_percent: homeiiEditorI18n("ui.volume_step_percent"),
      voice_assistant_enabled: homeiiEditorI18n("ui.flow_assistant", {}, "FLOW ASSISTANT"),
      voice_assistant_section: homeiiEditorI18n("ui.flow_assistant", {}, "FLOW ASSISTANT"),
      voice_assistant_grid: homeiiEditorI18n("ui.flow_assistant", {}, "FLOW ASSISTANT"),
      voice_assistant_mode: homeiiEditorI18n("ui.voice_assistant_mode"),
      voice_assistant_agent_id: homeiiEditorI18n("ui.assist_agent"),
      voice_assistant_speak_feedback: homeiiEditorI18n("ui.voice_feedback"),
      flow_assistant_response_timeout_ms: "Flow Assistant response timeout",
      flow_assistant_listen_timeout_ms: "Flow Assistant listen timeout",
      flow_assistant_auto_close_ms: "Flow Assistant auto close",
      mobile_liked_mode: homeiiEditorI18n("ui.liked_mode"),
      mobile_radio_browser_country: homeiiEditorI18n("ui.radio_browser_country_2"),
      mobile_main_bar_items: homeiiEditorI18n("ui.main_bar_items_2"),
      mobile_quick_actions: homeiiEditorI18n("ui.quick_actions"),
      ...quickActionSlotLabels,
      mobile_library_default_layout: homeiiEditorI18n("ui.default_library_layout", {}, "Default library layout"),
      mobile_library_tabs: homeiiEditorI18n("ui.library_tabs_2"),
      mobile_announcement_presets: homeiiEditorI18n("ui.announcement_presets"),
      mobile_announcement_volume: homeiiEditorI18n("ui.announcement_volume_boost"),
      announcement_tts_entity: homeiiEditorI18n("ui.tts_entity"),
      announcement_tts_language: homeiiEditorI18n("ui.tts_language"),
      ambient_light_enabled: homeiiEditorI18n("ui.ambient_light"),
      ambient_light_entities: homeiiEditorI18n("ui.ambient_light_entities"),
      ambient_light_player_map: homeiiEditorI18n("ui.ambient_light_player_map"),
      ambient_light_brightness: homeiiEditorI18n("ui.ambient_light_brightness"),
      ambient_light_transition: homeiiEditorI18n("ui.ambient_light_transition"),
      ambient_light_cooldown: homeiiEditorI18n("ui.ambient_light_cooldown"),
      screensaver_enabled: homeiiEditorI18n("ui.screensaver"),
      screensaver_controls_enabled: homeiiEditorI18n("ui.screensaver_controls"),
      screensaver_control_buttons: homeiiEditorI18n("ui.screensaver_buttons"),
      screensaver_clock_mode: homeiiEditorI18n("ui.screensaver_clock_mode"),
      screensaver_timeout_seconds: homeiiEditorI18n("ui.screensaver_timeout"),
      screensaver_message: homeiiEditorI18n("ui.screensaver_message"),
      screensaver_clock_size: homeiiEditorI18n("ui.screensaver_clock_size"),
      screensaver_clock_x: homeiiEditorI18n("ui.screensaver_clock_x"),
      screensaver_clock_y: homeiiEditorI18n("ui.screensaver_clock_y"),
      power_button_enabled: homeiiEditorI18n("ui.power_button"),
      power_button_name: homeiiEditorI18n("ui.auxiliary_button_name"),
      power_button_icon: homeiiEditorI18n("ui.auxiliary_button_icon"),
      power_button_action: homeiiEditorI18n("ui.power_button_action"),
      power_button_entity: homeiiEditorI18n("ui.power_button_entity"),
      ...auxiliaryLabels,
      discovery_mode_enabled: homeiiEditorI18n("ui.discovery_mode"),
      pinned_player_entities: homeiiEditorI18n("ui.pinned_players"),
      excluded_player_entities: homeiiEditorI18n("ui.excluded_players"),
      player_sort_mode: homeiiEditorI18n("ui.player_sort"),
      player_order_entities: homeiiEditorI18n("ui.player_order"),
      ...playerOrderSlotLabels,
      config_entry_id: "Config Entry ID",
      ma_url: homeiiEditorI18n("ui.music_assistant_url"),
      music_assistant_external_url: "Music Assistant external URL",
      ma_token: homeiiEditorI18n("ui.music_assistant_token"),
      active_player_helper_entity: homeiiEditorI18n("ui.active_player_helper"),
      favorite_button_entity: homeiiEditorI18n("ui.favorite_button_entity"),
      ma_interface_url: homeiiEditorI18n("ui.ma_interface_path"),
      ma_interface_target: homeiiEditorI18n("ui.open_interface_in"),
      show_ma_button: homeiiEditorI18n("ui.show_ma_button"),
      show_theme_toggle: homeiiEditorI18n("ui.show_theme_toggle"),
      cache_ttl: homeiiEditorI18n("ui.cache_ttl"),
      music_assistant_timeout_ms: "Music Assistant timeout",
      allow_local_likes: homeiiEditorI18n("ui.allow_local_likes"),
      use_mass_queue_send_command: homeiiEditorI18n("ui.mass_queue_send_command_fallback"),
    },
    helpers: {
      settings_source: homeiiEditorI18n("ui.choose_whether_settings_are_controlled_from_the_in_card_ui_or_from_the_c"),
      layout_mode: homeiiEditorI18n("ui.auto_chooses_mobile_or_tablet_based_on_actual_width"),
      height: homeiiEditorI18n("ui.card_height_in_pixels"),
      theme_mode: homeiiEditorI18n("ui.includes_the_custom_theme_mode_from_the_in_card_settings_screen"),
      night_mode: homeiiEditorI18n("ui.off_disables_it_on_keeps_it_active_and_auto_follows_the_configured_time"),
      night_mode_auto_start: homeiiEditorI18n("ui.recommended_format_hh_mm_such_as_22_00"),
      night_mode_auto_end: homeiiEditorI18n("ui.recommended_format_hh_mm_such_as_06_00_crossing_midnight_is_supported"),
      night_mode_days: homeiiEditorI18n("ui.choose_which_days_the_auto_night_mode_window_applies_to"),
      mobile_show_up_next: homeiiEditorI18n("ui.show_or_hide_the_inline_next_track_row_in_now_playing"),
      hotel_mode: homeiiEditorI18n("ui.hotel_mode_helper", {}, "Minimal hotel-safe UI with only player controls, volume, search, artwork browsing, and player selection."),
      show_confirmation_toasts: homeiiEditorI18n("ui.show_confirmation_toasts_helper", {}, "Show brief confirmation messages after actions like selecting a player or adding to liked. Disable to suppress these; error messages still appear regardless."),
      mobile_dynamic_theme_mode: homeiiEditorI18n("ui.extract_colors_from_the_current_artwork_and_apply_them_to_the_interface"),
      mobile_background_motion_mode: homeiiEditorI18n("ui.control_whether_the_card_background_moves_gently_and_how_strong_the_moti"),
      performance_profile: homeiiEditorI18n("ui.performance_profile_helper"),
      performance_mode: homeiiEditorI18n("ui.turns_off_heavy_visuals_so_the_card_runs_smoother_on_nest_hub_older_tabl"),
      mobile_font_scale: homeiiEditorI18n("ui.global_scale_for_every_interface_font_1_is_the_default_size"),
      mobile_icon_scale: homeiiEditorI18n("ui.scales_interface_icons_without_changing_button_sizes"),
      mobile_compact_mode: homeiiEditorI18n("ui.shows_a_standalone_compact_player_tile_with_artwork_basic_controls_volum"),
      mobile_compact_widget_mode: homeiiEditorI18n("ui.choose_when_compact_mode_uses_the_two_row_mobile_widget", {}, "Choose when compact mode uses the smaller two-row mobile widget."),
      mobile_compact_edge_to_edge: homeiiEditorI18n("ui.compact_edge_to_edge_helper", {}, "When disabled, compact expand opens as a floating window so Home Assistant navigation remains visible."),
      mobile_layout_mode: homeiiEditorI18n("ui.mobile_layout_mode_helper", {}, "Auto uses the available card space. Full keeps the phone player inline and requests a tall Sections slot. Compact always uses the compact tile."),
      mobile_swipe_mode: homeiiEditorI18n("ui.choose_whether_artwork_swipe_changes_track_or_browses_covers"),
      mobile_footer_search_enabled: homeiiEditorI18n("ui.enable_or_disable_the_footer_search_button"),
      mobile_mic_mode: homeiiEditorI18n("ui.matches_the_microphone_setting_from_the_in_card_settings_screen"),
      mobile_footer_mode: homeiiEditorI18n("ui.choose_icons_text_or_both_for_the_footer"),
      mobile_studio_shortcut: homeiiEditorI18n("ui.enable_or_disable_the_studio_button_in_the_footer_bar"),
      mobile_home_shortcut: homeiiEditorI18n("ui.show_home_inside_quick_actions"),
      mobile_home_shortcut_path: homeiiEditorI18n("ui.for_example_lovelace_home_or_any_other_home_assistant_path"),
      mobile_volume_mode: homeiiEditorI18n("ui.mainly_relevant_on_larger_layouts"),
      mobile_volume_step_buttons: homeiiEditorI18n("ui.show_plus_minus_buttons_next_to_the_volume_slider"),
      mobile_volume_step_percent: homeiiEditorI18n("ui.volume_step_between_1_and_10_percent_default_5"),
      voice_assistant_enabled: homeiiEditorI18n("ui.show_a_push_to_talk_button_for_music_and_assist_commands"),
      voice_assistant_mode: homeiiEditorI18n("ui.hybrid_handles_music_locally_and_sends_unknown_commands_to_assist"),
      voice_assistant_agent_id: homeiiEditorI18n("ui.optional_assist_agent_leave_empty_for_home_assistant_default"),
      voice_assistant_speak_feedback: homeiiEditorI18n("ui.speak_voice_assistant_responses_out_loud"),
      flow_assistant_response_timeout_ms: "Maximum milliseconds to wait while Flow Assistant processes a captured command.",
      flow_assistant_listen_timeout_ms: "Maximum milliseconds Flow Assistant can wait for speech before showing a clear timeout.",
      flow_assistant_auto_close_ms: "Milliseconds to keep the Flow Assistant result open. Use 0 to keep it open.",
      mobile_liked_mode: homeiiEditorI18n("ui.local_mode_is_only_meaningful_when_local_likes_are_enabled"),
      mobile_radio_browser_country: homeiiEditorI18n("ui.uses_the_same_base_country_list_shown_in_the_in_card_settings_screen"),
      mobile_main_bar_items: homeiiEditorI18n("ui.choose_which_actions_appear_in_the_main_bar"),
      mobile_quick_actions: homeiiEditorI18n("ui.choose_which_icons_appear_in_the_quick_action_row"),
      ...quickActionSlotHelpers,
      mobile_library_default_layout: homeiiEditorI18n("ui.choose_how_library_pages_open_grid_or_list_can_still_be_changed_manually", {}, "Choose how library pages open. You can still switch Grid/List inside the library."),
      mobile_library_tabs: homeiiEditorI18n("ui.choose_which_tabs_are_available_in_the_library_screen"),
      mobile_announcement_presets: homeiiEditorI18n("ui.configure_ready_made_announcement_phrases"),
      mobile_announcement_volume: homeiiEditorI18n("ui.adds_to_the_current_volume_only_during_announcements_then_restores_the_p"),
      mobile_custom_color: homeiiEditorI18n("ui.choose_the_accent_color_for_the_mobile_layout"),
      active_player_helper_entity: homeiiEditorI18n("ui.optional_input_text_helper_updated_with_the_active_player_entity_id_for_2"),
      music_assistant_external_url: "Optional HTTPS Music Assistant URL used when Home Assistant is loaded over HTTPS.",
      favorite_button_entity: homeiiEditorI18n("ui.optional_entity_used_for_an_external_favorite_button"),
      announcement_tts_entity: homeiiEditorI18n("ui.tts_entity_used_by_the_announcement_screen"),
      announcement_tts_language: homeiiEditorI18n("ui.auto_leaves_home_assistant_cloud_voice_defaults_untouched_manual_choices"),
      ambient_light_enabled: homeiiEditorI18n("ui.sync_selected_lights_to_the_current_artwork_color"),
      ambient_light_entities: homeiiEditorI18n("ui.choose_only_the_lights_that_should_follow_the_music"),
      ambient_light_player_map: homeiiEditorI18n("ui.ambient_light_player_map_helper"),
      ambient_light_brightness: homeiiEditorI18n("ui.maximum_brightness_for_music_lighting"),
      ambient_light_transition: homeiiEditorI18n("ui.soft_transition_time_for_music_lighting"),
      ambient_light_cooldown: homeiiEditorI18n("ui.minimum_seconds_between_light_updates"),
      screensaver_enabled: homeiiEditorI18n("ui.show_a_calm_clock_artwork_display_after_idle_time"),
      screensaver_controls_enabled: homeiiEditorI18n("ui.show_previous_next_controls_on_the_screensaver"),
      screensaver_control_buttons: homeiiEditorI18n("ui.choose_which_buttons_appear_on_the_screensaver"),
      screensaver_message: homeiiEditorI18n("ui.short_optional_message_shown_on_the_screensaver"),
      screensaver_clock_size: homeiiEditorI18n("ui.screensaver_clock_size_helper"),
      screensaver_clock_x: homeiiEditorI18n("ui.screensaver_clock_x_helper"),
      screensaver_clock_y: homeiiEditorI18n("ui.screensaver_clock_y_helper"),
      power_button_enabled: homeiiEditorI18n("ui.show_power_button_in_the_player_controls"),
      power_button_name: homeiiEditorI18n("ui.optional_name_for_the_auxiliary_button"),
      power_button_icon: homeiiEditorI18n("ui.choose_the_auxiliary_button_icon"),
      power_button_entity: homeiiEditorI18n("ui.optional_entity_for_the_power_button_leave_empty_to_stop_the_active_player"),
      ...auxiliaryHelpers,
      discovery_mode_enabled: homeiiEditorI18n("ui.show_the_fullscreen_discovery_mode_in_actions"),
      pinned_player_entities: homeiiEditorI18n("ui.choose_music_assistant_players_only_the_in_card_pinning_list_shows_only"),
      excluded_player_entities: homeiiEditorI18n("ui.choose_music_assistant_players_to_hide_from_the_card"),
      player_sort_mode: homeiiEditorI18n("ui.choose_how_players_are_sorted"),
      player_order_entities: homeiiEditorI18n("ui.set_custom_player_order"),
      ...playerOrderSlotHelpers,
      allow_local_likes: homeiiEditorI18n("ui.enables_switching_to_local_liked_mode"),
      music_assistant_timeout_ms: "Maximum milliseconds to wait for Music Assistant service responses before showing an error.",
      use_mass_queue_send_command: homeiiEditorI18n("ui.fallback_for_setups_that_need_an_alternate_queue_service_path"),
    },
    options: {
      settings_source: [
        { value: "ui", label: homeiiEditorI18n("ui.in_card_ui") },
        { value: "card", label: homeiiEditorI18n("ui.card_configuration") },
      ],
      layout_mode: [
        { value: "auto", label: "Auto" },
        { value: "mobile", label: homeiiEditorI18n("ui.mobile") },
        { value: "tablet", label: homeiiEditorI18n("ui.tablet") },
      ],
      language: visibleLanguageOptions(),
      theme_mode: [
        { value: "auto", label: "Auto" },
        { value: "dark", label: homeiiEditorI18n("ui.dark") },
        { value: "light", label: homeiiEditorI18n("ui.light") },
        { value: "custom", label: homeiiEditorI18n("ui.custom") },
      ],
      night_mode: [
        { value: "off", label: homeiiEditorI18n("ui.off") },
        { value: "auto", label: "Auto" },
        { value: "on", label: homeiiEditorI18n("ui.on") },
      ],
      performance_profile: [
        { value: "full", label: "Full" },
        { value: "high", label: "High" },
        { value: "low", label: "Low" },
        { value: "ultra_lite", label: "Ultra Lite" },
      ],
      night_mode_days: [
        { value: 0, label: homeiiEditorI18n("ui.sun") },
        { value: 1, label: homeiiEditorI18n("ui.mon") },
        { value: 2, label: homeiiEditorI18n("ui.tue") },
        { value: 3, label: homeiiEditorI18n("ui.wed") },
        { value: 4, label: homeiiEditorI18n("ui.thu") },
        { value: 5, label: homeiiEditorI18n("ui.fri") },
        { value: 6, label: homeiiEditorI18n("ui.sat") },
      ],
      mobile_custom_text_tone: [
        { value: "light", label: homeiiEditorI18n("ui.light") },
        { value: "dark", label: homeiiEditorI18n("ui.dark") },
      ],
      mobile_dynamic_theme_mode: [
        { value: "off", label: homeiiEditorI18n("ui.off") },
        { value: "auto", label: "Auto" },
        { value: "strong", label: homeiiEditorI18n("ui.strong") },
      ],
      mobile_background_motion_mode: [
        { value: "off", label: homeiiEditorI18n("ui.off") },
        { value: "subtle", label: homeiiEditorI18n("ui.subtle") },
        { value: "strong", label: homeiiEditorI18n("ui.strong") },
        { value: "extreme", label: homeiiEditorI18n("ui.extreme") },
      ],
      mobile_compact_widget_mode: [
        { value: "auto", label: "Auto" },
        { value: "full", label: homeiiEditorI18n("ui.full", {}, "Full") },
        { value: "mini", label: homeiiEditorI18n("ui.mini_widget", {}, "Mini widget") },
      ],
      mobile_layout_mode: [
        { value: "auto", label: "Auto" },
        { value: "full", label: homeiiEditorI18n("ui.full", {}, "Full") },
        { value: "compact", label: homeiiEditorI18n("ui.compact", {}, "Compact") },
      ],
      mobile_swipe_mode: [
        { value: "play", label: homeiiEditorI18n("ui.change_track") },
        { value: "browse", label: homeiiEditorI18n("ui.browse_covers") },
      ],
      mobile_mic_mode: [
        { value: "on", label: homeiiEditorI18n("ui.on") },
        { value: "off", label: homeiiEditorI18n("ui.off") },
        { value: "smart", label: homeiiEditorI18n("ui.smart") },
      ],
      announcement_tts_language: [
        { value: "auto", label: homeiiEditorI18n("ui.auto_cloud_default") },
        { value: "en-US", label: "English (US)" },
        { value: "en-GB", label: "English (UK)" },
        { value: "he-IL", label: homeiiEditorI18n("ui.hebrew") },
        { value: "de-DE", label: "Deutsch" },
        { value: "fr-FR", label: "Français" },
        { value: "es-ES", label: "Español" },
        { value: "it-IT", label: "Italiano" },
      ],
      mobile_footer_mode: [
        { value: "icon", label: homeiiEditorI18n("ui.icon_only") },
        { value: "text", label: homeiiEditorI18n("ui.text_only") },
        { value: "both", label: homeiiEditorI18n("ui.icon_plus_text") },
      ],
      mobile_volume_mode: [
        { value: "button", label: homeiiEditorI18n("ui.button") },
        { value: "always", label: homeiiEditorI18n("ui.always_visible") },
      ],
      voice_assistant_mode: [
        { value: "hybrid", label: homeiiEditorI18n("ui.hybrid_music_plus_assist") },
        { value: "music", label: homeiiEditorI18n("ui.music_only") },
        { value: "assist", label: homeiiEditorI18n("ui.assist_only") },
      ],
      mobile_liked_mode: [
        { value: "ma", label: "Music Assistant" },
        { value: "local", label: homeiiEditorI18n("ui.local") },
      ],
      mobile_library_default_layout: [
        { value: "grid", label: homeiiEditorI18n("ui.grid") },
        { value: "list", label: homeiiEditorI18n("ui.list") },
      ],
      screensaver_clock_mode: [
        { value: "digital", label: homeiiEditorI18n("ui.digital") },
        { value: "analog", label: homeiiEditorI18n("ui.analog") },
      ],
      screensaver_control_buttons: [
        { value: "previous", label: homeiiEditorI18n("ui.previous") },
        { value: "play_pause", label: homeiiEditorI18n("ui.play_pause") },
        { value: "next", label: homeiiEditorI18n("ui.next") },
        { value: "mute", label: homeiiEditorI18n("ui.mute") },
        { value: "power", label: homeiiEditorI18n("ui.auxiliary_button") },
        { value: "like", label: homeiiEditorI18n("ui.like_2") },
        { value: "lyrics", label: homeiiEditorI18n("ui.lyrics") },
        { value: "voice", label: homeiiEditorI18n("ui.flow_assistant", {}, "FLOW ASSISTANT") },
      ],
      power_button_action: [
        { value: "stop_player", label: homeiiEditorI18n("ui.stop_player") },
        { value: "toggle", label: homeiiEditorI18n("ui.toggle") },
        { value: "turn_on", label: homeiiEditorI18n("ui.turn_on") },
        { value: "turn_off", label: homeiiEditorI18n("ui.turn_off") },
        { value: "scene", label: homeiiEditorI18n("ui.scene") },
        { value: "script", label: homeiiEditorI18n("ui.script") },
      ],
      auxiliary_button_icons: [
        { value: "power", label: homeiiEditorI18n("ui.power") },
        { value: "home", label: homeiiEditorI18n("ui.home") },
        { value: "speaker", label: homeiiEditorI18n("ui.players") },
        { value: "music_note", label: homeiiEditorI18n("ui.music") },
        { value: "wand", label: homeiiEditorI18n("ui.surprise_me") },
        { value: "grid", label: homeiiEditorI18n("ui.actions_2") },
        { value: "settings", label: homeiiEditorI18n("ui.settings") },
        { value: "heart_outline", label: homeiiEditorI18n("ui.like_2") },
        { value: "play", label: homeiiEditorI18n("ui.play") },
        { value: "stop", label: homeiiEditorI18n("ui.stop_all") },
        { value: "radio", label: homeiiEditorI18n("ui.radio") },
        { value: "timer", label: homeiiEditorI18n("ui.timer") },
        { value: "info", label: homeiiEditorI18n("ui.info") },
      ],
      player_sort_mode: [
        { value: "default", label: homeiiEditorI18n("ui.default_order") },
        { value: "alphabetical", label: homeiiEditorI18n("ui.alphabetical") },
        { value: "custom", label: homeiiEditorI18n("ui.custom_order") },
      ],
      ma_interface_target: [
        { value: "_self", label: "_self" },
        { value: "_blank", label: "_blank" },
      ],
      mobile_main_bar_items: [
        { value: "search", label: homeiiEditorI18n("ui.search") },
        { value: "library", label: homeiiEditorI18n("ui.library_2") },
        { value: "players", label: homeiiEditorI18n("ui.players") },
        { value: "actions", label: homeiiEditorI18n("ui.actions_2") },
        { value: "settings", label: homeiiEditorI18n("ui.settings") },
        { value: "theme", label: homeiiEditorI18n("ui.theme_toggle_2") },
      ],
      mobile_quick_actions: quickActionOptions,
      mobile_quick_action_slots: [
        { value: "", label: homeiiEditorI18n("ui.none") },
        ...quickActionOptions,
      ],
      mobile_library_tabs: [
        { value: "library_search", label: homeiiEditorI18n("ui.search") },
        { value: "library_playlists", label: homeiiEditorI18n("ui.playlists") },
        { value: "library_artists", label: homeiiEditorI18n("ui.artists") },
        { value: "library_albums", label: homeiiEditorI18n("ui.albums") },
        { value: "library_tracks", label: homeiiEditorI18n("ui.tracks") },
        { value: "library_radio", label: homeiiEditorI18n("ui.radio") },
        { value: "library_podcasts", label: homeiiEditorI18n("ui.podcasts") },
        { value: "library_liked", label: homeiiEditorI18n("ui.liked") },
      ],
    },
  };
}

export function getRadioBrowserCountrySelectorOptions(translateFn = homeiiEditorI18n, language = "") {
  const lang = language || (HomeiiEditorLocale.detectEditorHebrew() ? "he" : "en");
  return homeiiRadioBrowserCountrySelectorOptions(translateFn, lang);
}

export function getMobileCardConfigForm() {
  const t = getMobileEditorTexts();
  return {
    schema: [
      {
        type: "expandable",
        name: "general_section",
        title: t.sections.general,
        flatten: true,
        schema: [
          {
            type: "grid",
            name: "general_grid",
            flatten: true,
            column_min_width: "220px",
            schema: [
              { name: "settings_source", selector: { select: { mode: "dropdown", options: t.options.settings_source } } },
              { name: "layout_mode", selector: { select: { mode: "dropdown", options: t.options.layout_mode } } },
              { name: "height", selector: { number: { min: 280, max: 1800, step: 10, mode: "box" } } },
              { name: "language", selector: { select: { mode: "dropdown", options: t.options.language } } },
              { name: "mobile_show_up_next", selector: { boolean: {} } },
              { name: "rtl", selector: { boolean: {} } },
              { name: "hotel_mode", selector: { boolean: {} } },
              { name: "show_confirmation_toasts", selector: { boolean: {} } },
              { name: "mobile_compact_mode", selector: { boolean: {} } },
              { name: "mobile_layout_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_layout_mode } } },
              { name: "mobile_compact_widget_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_compact_widget_mode } } },
              { name: "pinned_player_entities", selector: { entity: { multiple: true, filter: [{ integration: "music_assistant", domain: "media_player" }] } } },
              { name: "excluded_player_entities", selector: { entity: { multiple: true, filter: [{ integration: "music_assistant", domain: "media_player" }] } } },
              { name: "player_sort_mode", selector: { select: { mode: "dropdown", options: t.options.player_sort_mode } } },
            ],
          },
          {
            type: "grid",
            name: "player_order_grid",
            flatten: true,
            column_min_width: "220px",
            schema: [],
          },
        ],
      },
      {
        type: "expandable",
        name: "appearance_section",
        title: t.sections.appearance,
        flatten: true,
        schema: [
          {
            type: "grid",
            name: "appearance_grid",
            flatten: true,
            column_min_width: "220px",
            schema: [
              { name: "theme_mode", selector: { select: { mode: "dropdown", options: t.options.theme_mode } } },
              { name: "night_mode", selector: { select: { mode: "dropdown", options: t.options.night_mode } } },
              { name: "main_opacity", selector: { number: { min: 0.3, max: 1, step: 0.02, mode: "slider" } } },
              { name: "popup_opacity", selector: { number: { min: 0.4, max: 1, step: 0.02, mode: "slider" } } },
              { name: "mobile_custom_color", selector: { text: { type: "color" } } },
              { name: "performance_profile", selector: { select: { mode: "dropdown", options: t.options.performance_profile } } },
              { name: "mobile_dynamic_theme_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_dynamic_theme_mode } } },
              { name: "mobile_background_motion_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_background_motion_mode } } },
              { name: "mobile_custom_text_tone", selector: { select: { mode: "dropdown", options: t.options.mobile_custom_text_tone } } },
              { name: "mobile_font_scale", selector: { number: { min: 0.5, max: 1.5, step: 0.05, mode: "slider" } } },
              { name: "mobile_icon_scale", selector: { number: { min: 0.8, max: 1.25, step: 0.05, mode: "slider" } } },
              { name: "mobile_footer_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_footer_mode } } },
            ],
          },
        ],
      },
      {
        type: "expandable",
        name: "behavior_section",
        title: t.sections.behavior,
        flatten: true,
        schema: [
          {
            type: "grid",
            name: "behavior_grid",
            flatten: true,
            column_min_width: "220px",
            schema: [
              { name: "mobile_swipe_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_swipe_mode } } },
              { name: "mobile_mic_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_mic_mode } } },
              { name: "mobile_home_shortcut", selector: { boolean: {} } },
              { name: "mobile_home_shortcut_path", selector: { text: {} } },
              { name: "mobile_volume_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_volume_mode } } },
              { name: "mobile_volume_step_buttons", selector: { boolean: {} } },
              { name: "mobile_volume_step_percent", selector: { number: { min: 1, max: 10, step: 1, mode: "slider" } } },
              { name: "mobile_liked_mode", selector: { select: { mode: "dropdown", options: t.options.mobile_liked_mode } } },
              { name: "mobile_radio_browser_country", selector: { select: { mode: "dropdown", options: getRadioBrowserCountrySelectorOptions() } } },
            ],
          },
        ],
      },
      {
        type: "expandable",
        name: "connection_section",
        title: t.sections.connection,
        flatten: true,
        schema: [
          {
            type: "grid",
            name: "connection_grid",
            flatten: true,
            column_min_width: "220px",
            schema: [
              { name: "config_entry_id", selector: { text: {} } },
              { name: "ma_url", selector: { text: { type: "url" } } },
              { name: "music_assistant_external_url", selector: { text: { type: "url" } } },
              { name: "ma_token", selector: { text: {} } },
              { name: "active_player_helper_entity", selector: { entity: { multiple: false, filter: [{ domain: "input_text" }] } } },
              { name: "favorite_button_entity", selector: { entity: { multiple: false } } },
              { name: "ma_interface_url", selector: { text: {} } },
              { name: "ma_interface_target", selector: { select: { mode: "dropdown", options: t.options.ma_interface_target } } },
              { name: "show_ma_button", selector: { boolean: {} } },
              { name: "show_theme_toggle", selector: { boolean: {} } },
              { name: "cache_ttl", selector: { number: { min: 0, max: 3600000, step: 1000, mode: "box" } } },
              { name: "music_assistant_timeout_ms", selector: { number: { min: 3000, max: 60000, step: 1000, mode: "box" } } },
              { name: "allow_local_likes", selector: { boolean: {} } },
              { name: "use_mass_queue_send_command", selector: { boolean: {} } },
            ],
          },
        ],
      },
      {
        type: "expandable",
        name: "voice_assistant_section",
        title: t.sections.voice_assistant,
        helper: t.helpers.voice_assistant_enabled,
        flatten: true,
        schema: [
          {
            type: "grid",
            name: "voice_assistant_grid",
            flatten: true,
            column_min_width: "220px",
            schema: [
              { name: "voice_assistant_enabled", label: t.labels.voice_assistant_enabled, helper: t.helpers.voice_assistant_enabled, selector: { boolean: {} } },
              { name: "voice_assistant_mode", label: t.labels.voice_assistant_mode, helper: t.helpers.voice_assistant_mode, selector: { select: { mode: "dropdown", options: t.options.voice_assistant_mode } } },
              { name: "voice_assistant_agent_id", label: t.labels.voice_assistant_agent_id, helper: t.helpers.voice_assistant_agent_id, selector: { entity: { multiple: false, filter: [{ domain: "conversation" }] } } },
              { name: "voice_assistant_speak_feedback", label: t.labels.voice_assistant_speak_feedback, helper: t.helpers.voice_assistant_speak_feedback, selector: { boolean: {} } },
              { name: "flow_assistant_response_timeout_ms", label: t.labels.flow_assistant_response_timeout_ms, helper: t.helpers.flow_assistant_response_timeout_ms, selector: { number: { min: 5000, max: 60000, step: 1000, mode: "box" } } },
              { name: "flow_assistant_listen_timeout_ms", label: t.labels.flow_assistant_listen_timeout_ms, helper: t.helpers.flow_assistant_listen_timeout_ms, selector: { number: { min: 5000, max: 30000, step: 1000, mode: "box" } } },
              { name: "flow_assistant_auto_close_ms", label: t.labels.flow_assistant_auto_close_ms, helper: t.helpers.flow_assistant_auto_close_ms, selector: { number: { min: 0, max: 30000, step: 500, mode: "box" } } },
            ],
          },
        ],
      },
      {
        type: "expandable",
        name: "smart_home_section",
        title: t.sections.smart_home,
        flatten: true,
        schema: [
          {
            type: "grid",
            name: "smart_home_grid",
            flatten: true,
            column_min_width: "220px",
            schema: [
              { name: "ambient_light_enabled", selector: { boolean: {} } },
              { name: "ambient_light_entities", selector: { entity: { multiple: true, filter: [{ domain: "light" }] } } },
              { name: "ambient_light_player_map", selector: { text: { multiple: true } } },
              { name: "ambient_light_brightness", selector: { number: { min: 1, max: 100, step: 1, mode: "slider" } } },
              { name: "ambient_light_transition", selector: { number: { min: 0, max: 120, step: 1, mode: "box" } } },
              { name: "ambient_light_cooldown", selector: { number: { min: 0, max: 120, step: 1, mode: "box" } } },
              { name: "screensaver_enabled", selector: { boolean: {} } },
              { name: "screensaver_controls_enabled", selector: { boolean: {} } },
              { name: "screensaver_control_buttons", selector: { select: { multiple: true, mode: "list", options: t.options.screensaver_control_buttons } } },
              { name: "screensaver_clock_mode", selector: { select: { mode: "dropdown", options: t.options.screensaver_clock_mode } } },
              { name: "screensaver_clock_size", selector: { number: { min: 0.75, max: 1.45, step: 0.05, mode: "slider" } } },
              { name: "screensaver_clock_x", selector: { number: { min: 8, max: 92, step: 1, mode: "slider" } } },
              { name: "screensaver_clock_y", selector: { number: { min: 8, max: 70, step: 1, mode: "slider" } } },
              { name: "screensaver_timeout_seconds", selector: { number: { min: 15, max: 3600, step: 5, mode: "box" } } },
              { name: "screensaver_message", selector: { text: {} } },
              { name: "power_button_enabled", selector: { boolean: {} } },
              { name: "power_button_name", selector: { text: {} } },
              { name: "power_button_icon", selector: { icon: {} } },
              { name: "power_button_action", selector: { select: { mode: "dropdown", options: t.options.power_button_action } } },
              { name: "power_button_entity", selector: { entity: { multiple: false } } },
              ...Array.from({ length: 3 }, (_, offset) => {
                const index = offset + 2;
                return [
                  { name: `aux_button_${index}_enabled`, selector: { boolean: {} } },
                  { name: `aux_button_${index}_name`, selector: { text: {} } },
                  { name: `aux_button_${index}_icon`, selector: { icon: {} } },
                  { name: `aux_button_${index}_action`, selector: { select: { mode: "dropdown", options: t.options.power_button_action } } },
                  { name: `aux_button_${index}_entity`, selector: { entity: { multiple: false } } },
                ];
              }).flat(),
              { name: "discovery_mode_enabled", selector: { boolean: {} } },
            ],
          },
        ],
      },
      {
        type: "expandable",
        name: "mainbar_section",
        title: t.sections.mainbar,
        flatten: true,
        schema: [
          {
            name: "mobile_main_bar_items",
            selector: {
              select: {
                multiple: true,
                mode: "list",
                options: t.options.mobile_main_bar_items,
              },
            },
          },
          { name: "mobile_studio_shortcut", selector: { boolean: {} } },
        ],
      },
      {
        type: "expandable",
        name: "quickactions_section",
        title: t.sections.quickactions,
        flatten: true,
        schema: [
          {
            name: "mobile_quick_actions",
            selector: {
              select: {
                multiple: true,
                mode: "list",
                options: t.options.mobile_quick_actions,
              },
            },
          },
          {
            type: "grid",
            name: "quickactions_order_grid",
            flatten: true,
            column_min_width: "180px",
            schema: Array.from({ length: 10 }, (_, index) => ({
              name: `mobile_quick_action_${index + 1}`,
              selector: {
                select: {
                  mode: "dropdown",
                  options: t.options.mobile_quick_action_slots,
                },
              },
            })),
          },
        ],
      },
      {
        type: "expandable",
        name: "library_section",
        title: t.sections.library,
        flatten: true,
        schema: [
          { name: "mobile_library_default_layout", selector: { select: { mode: "dropdown", options: t.options.mobile_library_default_layout } } },
          {
            name: "mobile_library_tabs",
            selector: {
              select: {
                multiple: true,
                mode: "list",
                options: t.options.mobile_library_tabs,
              },
            },
          },
        ],
      },
      {
        type: "expandable",
        name: "announcements_section",
        title: t.sections.announcements,
        flatten: true,
        schema: [
          {
            type: "grid",
            name: "announcements_grid",
            flatten: true,
            column_min_width: "220px",
            schema: [
              { name: "mobile_announcement_presets", selector: { text: { multiple: true } } },
              { name: "mobile_announcement_volume", selector: { number: { min: 20, max: 50, step: 1, mode: "slider" } } },
              { name: "announcement_tts_entity", selector: { entity: { multiple: false } } },
              { name: "announcement_tts_language", selector: { select: { mode: "dropdown", options: t.options.announcement_tts_language } } },
            ],
          },
        ],
      },
    ],
    computeLabel: (schema) => homeiiEditorLabelFor(schema, t.labels),
    computeHelper: (schema) => homeiiEditorHelperFor(schema, t.helpers),
    assertConfig: (config) => {
      if (!config || typeof config !== "object" || Array.isArray(config)) {
        throw new Error("Card config must be an object");
      }
    },
  };
}
