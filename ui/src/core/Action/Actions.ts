import {
  ArchivePayload,
  DirectorPayload,
  ElasticsearchPayload,
  ForeachPayload,
  Icinga2Payload,
  LoggerPayload,
  ScriptPayload,
  SmartMonitoringCheckResultPayload,
} from "@/core/Action/Payload";
import { ActionDto } from "tornado-backend-dto";

export abstract class BaseAction {
  id: string;
  payload:
    | ForeachPayload
    | ArchivePayload
    | DirectorPayload
    | ElasticsearchPayload
    | Icinga2Payload
    | LoggerPayload
    | SmartMonitoringCheckResultPayload
    | ScriptPayload;

  constructor(
    id: string,
    payload:
      | ForeachPayload
      | ArchivePayload
      | DirectorPayload
      | ElasticsearchPayload
      | Icinga2Payload
      | LoggerPayload
      | SmartMonitoringCheckResultPayload
      | ScriptPayload
  ) {
    this.id = id;
    this.payload = payload;
  }

  toDTO(): ActionDto {
    return {
      id: this.id,
      payload: this.payload.toDto(),
    };
  }
}

export class ForeachAction extends BaseAction {
  constructor(payload: ForeachPayload) {
    super("foreach", payload);
  }
}

export class ArchiveAction extends BaseAction {
  constructor(payload: ArchivePayload) {
    super("archive", payload);
  }
}

export class DirectorAction extends BaseAction {
  constructor(payload: DirectorPayload) {
    super("director", payload);
  }
}

export class ElasticsearchAction extends BaseAction {
  constructor(payload: ElasticsearchPayload) {
    super("elasticsearch", payload);
  }
}

export class Icinga2Action extends BaseAction {
  constructor(payload: Icinga2Payload) {
    super("icinga2", payload);
  }
}

export class LoggerAction extends BaseAction {
  constructor(payload: LoggerPayload) {
    super("logger", payload);
  }
}

export class SmartMonitoringCheckResultAction extends BaseAction {
  constructor(payload: SmartMonitoringCheckResultPayload) {
    super("smart_monitoring_check_result", payload);
  }
}

export class ScriptAction extends BaseAction {
  constructor(payload: ScriptPayload) {
    super("script", payload);
  }
}
