import { BaseAction } from "@/core/Action/Actions";

export class ForeachPayload {
  actions: BaseAction[];
  target: string;

  constructor(actions: BaseAction[], target: string) {
    this.actions = actions;
    this.target = target;
  }

  toDto(): any {
    return {
      actions: this.actions.map((action) => action.toDTO()),
      target: this.target,
    };
  }
}

export class ArchivePayload {
  archive_type: string | null;
  event: string;

  constructor(event: string, archive_type: string | null) {
    this.archive_type = archive_type;
    this.event = event;
  }

  toDto(): any {
    return {
      archive_type: this.archive_type,
      event: this.event,
    };
  }
}

export class DirectorPayload {
  action_name: string;
  action_payload: Record<string, any>;
  icinga2_live_creation: boolean;

  constructor(
    action_name: string,
    action_payload: Record<string, any>,
    icinga2_live_creation: boolean
  ) {
    this.action_name = action_name;
    this.action_payload = action_payload;
    this.icinga2_live_creation = icinga2_live_creation;
  }

  toDto(): any {
    return {
      action_name: this.action_name,
      action_payload: this.action_payload,
      icinga2_live_creation: this.icinga2_live_creation,
    };
  }

  public toggleLiveCreation(): void {
    this.icinga2_live_creation = !this.icinga2_live_creation;
  }
}

export class ElasticsearchPayload {
  auth: any;
  data: Record<string, any>;
  endpoint: string;
  index: number;

  constructor(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    auth: any,
    data: Record<string, any>,
    endpoint: string,
    index: number
  ) {
    this.auth = auth;
    this.data = data;
    this.endpoint = endpoint;
    this.index = index;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  set authString(value: any) {
    this.auth = value;
  }

  set dataString(value: Record<string, any>) {
    this.data = value;
  }

  toDto(): any {
    return {
      auth: this.auth,
      data: this.data,
      endpoint: this.endpoint,
      index: this.index,
    };
  }
}

export class Icinga2Payload {
  icinga2_action_name: string;
  icinga2_action_payload: Record<string, any>;

  constructor(
    icinga2_action_name: string,
    icinga2_action_payload: Record<string, any>
  ) {
    this.icinga2_action_name = icinga2_action_name;
    this.icinga2_action_payload = icinga2_action_payload;
  }

  toDto(): Record<string, unknown> {
    return {
      icinga2_action_name: this.icinga2_action_name,
      icinga2_action_payload: this.icinga2_action_payload,
    };
  }
}

export class LoggerPayload {
  toDto(): any {
    return {};
  }
}

export class SmartMonitoringCheckResultPayload {
  check_result: Record<string, any>;
  host: Record<string, any>;
  service: Record<string, any>;

  constructor(
    check_result: Record<string, any>,
    host: Record<string, any>,
    service: Record<string, any>
  ) {
    this.check_result = check_result;
    this.host = host;
    this.service = service;
  }

  toDto(): any {
    return {
      check_result: this.check_result,
      host: this.host,
      service: this.service,
    };
  }
}

export class ScriptPayload {
  script: string;
  args: string[];

  constructor(script: string, args: string[]) {
    this.script = script;
    this.args = args;
  }

  toDto(): any {
    return {
      script: this.script,
      args: this.args,
    };
  }
}
